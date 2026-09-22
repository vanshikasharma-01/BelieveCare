import React, { useContext, useEffect, useRef, useState } from "react";
import { FaCommentDots, FaTimes, FaPaperPlane, FaCamera, FaWhatsapp } from "react-icons/fa";
import { CHATBOT_CONFIG } from "./chatbotConfig";
import { findMedicineMatch } from "./chatbotMedicines";
import { fetchOpenFdaSummary } from "./openFdaApi";
import { resolvePrescriptionMedicines } from "./prescriptionReader";
import { getMedicines } from "../../api/medicineApi";
import { CartContext, type Medicine } from "../../context/CartContext";
import { createWorker, type Worker as TesseractWorker } from "tesseract.js";
import "../../styles/chatbot.css";

interface ChatMessage {
  id: number;
  sender: "bot" | "user";
  text: string;
}

type QuickReply = { label: string; value: string };

const MAIN_QUICK_REPLIES: QuickReply[] = [
  { label: "↩️ Return Policy", value: "return policy" },
  { label: "🕒 Shop Timing & Location", value: "shop timing and location" },
  { label: "💊 Ask about a medicine", value: "medicine" },
  { label: "📄 Upload a Prescription", value: "upload prescription" },
  { label: "📞 Contact Us", value: "contact" },
];

let idCounter = 0;
function nextId() {
  idCounter += 1;
  return idCounter;
}

// Keyword sets used for basic intent matching on free-typed text.
const RETURN_KEYWORDS = ["return", "refund", "replace", "exchange", "cancel order"];
const TIMING_KEYWORDS = [
  "time", "timing", "hour", "open", "close", "location",
  "address", "where are you", "shop location", "near",
];
const MEDICINE_TRIGGER_KEYWORDS = ["medicine", "medicines", "tablet", "syrup", "drug"];

function detectIntent(
  text: string
): "return" | "timing" | "medicine" | "contact" | "medicine-lookup" | "unknown" {
  const t = text.toLowerCase();

  if (t === "return policy") return "return";
  if (t === "shop timing and location") return "timing";
  if (t === "contact") return "contact";

  if (RETURN_KEYWORDS.some((k) => t.includes(k))) return "return";
  if (TIMING_KEYWORDS.some((k) => t.includes(k))) return "timing";
  if (t === "medicine" || MEDICINE_TRIGGER_KEYWORDS.some((k) => t.includes(k))) {
    return "medicine";
  }

  // If it doesn't match a known intent, see if it matches a medicine
  // brand directly (e.g. user just types "dolo 650").
  if (findMedicineMatch(t)) return "medicine-lookup";

  return "unknown";
}

export default function ChatbotWidget() {
  const { addMultipleToCart } = useContext(CartContext);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: nextId(), sender: "bot", text: CHATBOT_CONFIG.greeting },
  ]);
  const [input, setInput] = useState("");
  const [awaitingMedicineName, setAwaitingMedicineName] = useState(false);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Cached OCR worker: creating one downloads/initializes the language
  // data, so we do that once and reuse it for every prescription upload
  // instead of paying that cost (and the reliability issues that come
  // with the deprecated one-shot Tesseract.recognize helper) each time.
  const ocrWorkerRef = useRef<TesseractWorker | null>(null);
  const ocrWorkerPromiseRef = useRef<Promise<TesseractWorker> | null>(null);

  async function getOcrWorker(): Promise<TesseractWorker> {
    if (ocrWorkerRef.current) return ocrWorkerRef.current;
    if (!ocrWorkerPromiseRef.current) {
      ocrWorkerPromiseRef.current = createWorker("eng").then((worker) => {
        ocrWorkerRef.current = worker;
        return worker;
      });
    }
    return ocrWorkerPromiseRef.current;
  }

  useEffect(() => {
    return () => {
      ocrWorkerRef.current?.terminate();
    };
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open, loading]);

  function addBotMessage(text: string) {
    setMessages((prev) => [...prev, { id: nextId(), sender: "bot", text }]);
  }

  function addUserMessage(text: string) {
    setMessages((prev) => [...prev, { id: nextId(), sender: "user", text }]);
  }

  async function handleMedicineLookup(rawText: string) {
    const match = findMedicineMatch(rawText);

    if (!match) {
      addBotMessage(CHATBOT_CONFIG.medicineNotFound);
      return;
    }

    if (!match.openFdaTerm) {
      addBotMessage(
        `${match.displayName} — ${match.generic}\n\nCommonly used for: ${match.commonUse}.\n\n` +
          `(This is a supplement/OTC item not indexed in the FDA drug database, so I can only show basic info. Always check the label or ask our pharmacist.)`
      );
      return;
    }

    setLoading(true);
    addBotMessage(CHATBOT_CONFIG.medicineLoading);

    const summary = await fetchOpenFdaSummary(match.openFdaTerm);
    setLoading(false);

    if (!summary || (!summary.purpose && !summary.indications && !summary.warnings)) {
      addBotMessage(
        `${match.displayName} — ${match.generic}\n\nCommonly used for: ${match.commonUse}.\n\n` +
          CHATBOT_CONFIG.medicineApiError
      );
      return;
    }

    const lines: string[] = [`${match.displayName} — ${match.generic}`];
    lines.push(`Commonly used for: ${match.commonUse}`);
    if (summary.purpose) lines.push(`\nPurpose: ${summary.purpose}`);
    if (summary.indications) lines.push(`\nUsed for: ${summary.indications}`);
    if (summary.dosage) lines.push(`\nDosage info: ${summary.dosage}`);
    if (summary.warnings) lines.push(`\nWarnings: ${summary.warnings}`);
    lines.push(
      "\n(Sourced from the US FDA drug label for the active ingredient — always follow the dosage advised by your doctor/pharmacist in India.)"
    );

    addBotMessage(lines.join("\n"));
  }

  function openPrescriptionPicker() {
    fileInputRef.current?.click();
  }

  async function handlePrescriptionImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    // Reset immediately so picking the same file again still fires onChange
    e.target.value = "";
    if (!file) return;

    addUserMessage("📄 Uploaded a prescription image");
    setLoading(true);
    addBotMessage(CHATBOT_CONFIG.prescriptionReading);

    try {
      const worker = await getOcrWorker();
      const {
        data: { text },
      } = await worker.recognize(file);

      const inventory: Medicine[] = await getMedicines();
      const results = resolvePrescriptionMedicines(text, inventory);

      if (results.length === 0) {
        addBotMessage(CHATBOT_CONFIG.prescriptionNoText);
        return;
      }

      const added: string[] = [];
      const outOfStock: string[] = [];
      const notAvailable: string[] = [];

      // Collect every matched, in-stock medicine first, then add them
      // all in one addMultipleToCart call. Calling addToCart once per
      // item in a loop reads the same stale cart state each time (see
      // the comment on addMultipleToCart in CartContext.tsx), so only
      // the last medicine in the prescription would ever actually end
      // up in the cart.
      const candidates: { line: string; medicine: Medicine }[] = [];

      for (const { line, medicine } of results) {
        if (!medicine) {
          notAvailable.push(line);
          continue;
        }

        if (medicine.stock <= 0) {
          outOfStock.push(medicine.name);
          continue;
        }

        candidates.push({ line, medicine });
      }

      if (candidates.length > 0) {
        const { addedCount } = addMultipleToCart(
          candidates.map(({ medicine }) => ({ product: medicine, quantity: 1 }))
        );

        if (addedCount > 0) {
          // addMultipleToCart reports a total count rather than which
          // specific items made it in (e.g. it may cap an item short
          // of its full requested quantity) — for this one-each batch,
          // treat every candidate as added and let its own toast cover
          // any partial/stock-limited edge case.
          added.push(...candidates.map(({ medicine }) => medicine.name));
        } else {
          // Nothing was added — most likely the login gate. addMultipleToCart
          // already showed its own toast for that.
          outOfStock.push(...candidates.map(({ medicine }) => medicine.name));
        }
      }

      const sections: string[] = [];
      if (added.length) {
        sections.push(
          `✅ Added to cart:\n${added.map((n) => `• ${n}`).join("\n")}`
        );
      }
      if (outOfStock.length) {
        sections.push(
          `⚠️ In our catalog but currently out of stock:\n${outOfStock
            .map((n) => `• ${n}`)
            .join("\n")}`
        );
      }
      if (notAvailable.length) {
        sections.push(
          `❌ Not available with us:\n${notAvailable
            .map((n) => `• ${n}`)
            .join("\n")}`
        );
      }

      addBotMessage(sections.length ? sections.join("\n\n") : CHATBOT_CONFIG.prescriptionNoMatches);
    } catch (error) {
      console.log("Prescription OCR error:", error);
      addBotMessage(CHATBOT_CONFIG.prescriptionError);
    } finally {
      setLoading(false);
    }
  }

  async function handleUserInput(rawText: string, displayText?: string) {
    const text = rawText.trim();
    if (!text) return;

    addUserMessage(displayText ?? text);
    setInput("");

    if (awaitingMedicineName) {
      setAwaitingMedicineName(false);
      await handleMedicineLookup(text);
      return;
    }

    const intent = detectIntent(text);

    switch (intent) {
      case "return":
        addBotMessage(CHATBOT_CONFIG.returnPolicy);
        break;
      case "timing":
        addBotMessage(`${CHATBOT_CONFIG.shopTimings}\n\n${CHATBOT_CONFIG.shopLocation}`);
        break;
      case "contact":
        addBotMessage(CHATBOT_CONFIG.contactInfo);
        break;
      case "medicine":
        setAwaitingMedicineName(true);
        addBotMessage("Sure — which medicine would you like to know about? (e.g. Dolo 650, Crocin, Cetirizine, Pan 40)");
        break;
      case "medicine-lookup":
        await handleMedicineLookup(text);
        break;
      default:
        addBotMessage(CHATBOT_CONFIG.fallback);
    }
  }

  function handleQuickReply(qr: QuickReply) {
    if (qr.value === "upload prescription") {
      openPrescriptionPicker();
      return;
    }
    handleUserInput(qr.value, qr.label);
  }

  function handleSend() {
    handleUserInput(input);
  }

  return (
    <div className="chatbot-root">
      {open && (
        <div className="chatbot-panel">
          <div className="chatbot-header">
            <span>{CHATBOT_CONFIG.botName}</span>
            <button
              className="chatbot-close-btn"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
            >
              <FaTimes />
            </button>
          </div>

          <div className="chatbot-messages" ref={scrollRef}>
            {messages.map((m) => (
              <div
                key={m.id}
                className={`chatbot-bubble ${m.sender === "bot" ? "bot" : "user"}`}
              >
                {m.text.split("\n").map((line, i) => (
                  <span key={i}>
                    {line}
                    <br />
                  </span>
                ))}
              </div>
            ))}

            {!loading &&
              !awaitingMedicineName &&
              messages[messages.length - 1]?.sender === "bot" && (
              <div className="chatbot-quick-replies">
                {MAIN_QUICK_REPLIES.map((qr) => (
                  <button
                    key={qr.value}
                    className="chatbot-quick-reply-btn"
                    onClick={() => handleQuickReply(qr)}
                  >
                    {qr.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="chatbot-input-row">
            <input
              type="file"
              accept="image/*"
              capture="environment"
              ref={fileInputRef}
              onChange={handlePrescriptionImage}
              style={{ display: "none" }}
            />
            <button
              className="chatbot-attach-btn"
              onClick={openPrescriptionPicker}
              aria-label="Upload a prescription photo"
              title="Upload a prescription photo"
              disabled={loading}
              type="button"
            >
              <FaCamera />
            </button>
            <input
              type="text"
              value={input}
              placeholder={
                awaitingMedicineName ? "Type the medicine name..." : "Type your question..."
              }
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSend();
              }}
            />
            <button
              className="chatbot-send-btn"
              onClick={handleSend}
              aria-label="Send message"
              disabled={loading}
            >
              <FaPaperPlane />
            </button>
          </div>

          <div className="chatbot-disclaimer">
            ⚠️ This assistant can make mistakes. Please verify important
            medical information with a pharmacist or doctor.
          </div>
        </div>
      )}

      <a
        href="https://wa.me/919650376479"
        target="_blank"
        rel="noopener noreferrer"
        className="whatsapp-fab"
        aria-label="Chat with Believecare on WhatsApp"
        title="Chat with us on WhatsApp"
      >
        <FaWhatsapp />
      </a>

      <button
        className="chatbot-launcher-btn"
        onClick={() => setOpen((o) => !o)}
        aria-label="Open chat assistant"
      >
        {open ? <FaTimes /> : <FaCommentDots />}
      </button>
    </div>
  );
}
