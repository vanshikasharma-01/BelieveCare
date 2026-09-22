/**
 * ============================================================
 *  CHATBOT CONFIG — PLACEHOLDER TEXT
 * ============================================================
 * Everything in this file is placeholder / dummy content.
 * Edit the strings below to match your real pharmacy details
 * (return policy, shop timings, address, contact info, etc).
 *
 * Later, if you want this to pull from real data instead of
 * placeholders, this is the only file that needs to change —
 * you could swap these constants for values coming from
 * `data/pharmacySettings.ts` or from a Settings API call.
 * ============================================================
 */

export const CHATBOT_CONFIG = {
  // Shown in the chat header
  botName: "Believecare Assistant",

  // Shown as the very first message when a customer opens the chat
  greeting:
    "Hi! 👋 I'm the Believecare Pharmacy assistant. I can help with our return policy, shop timings & location, or basic info about common medicines. What would you like to know?",

  // ---- EDIT ME: Return / Refund Policy ----
  returnPolicy:
    "Return & Refund Policy (placeholder — please update):\n\n" +
    "• Medicines can be returned within 7 days of delivery only if the seal/packaging is unopened and the product is not expired.\n" +
    "• Damaged, wrong, or expired items delivered to you are eligible for a full refund or replacement — please contact us within 48 hours with photos of the product.\n" +
    "• Refunds are processed to the original payment method within 5–7 business days after the return is approved.\n" +
    "• Certain items (opened medicine strips, prescription-only drugs once dispensed) cannot be returned as per pharmacy regulations.\n\n" +
    "For a return request, please visit our Contact Us page or call the shop directly.",

  // ---- EDIT ME: Shop Timings ----
  shopTimings:
    "Shop Timings :\n\n" +
    "• Monday – Saturday: 9:00 AM – 10:30 PM\n" +
    "• Sunday: 10:00 AM – 6:00 PM\n" +
    "• Open on most public holidays with reduced hours",

  // ---- EDIT ME: Shop Location / Address ----
  shopLocation:
    "Shop Location :\n\n" +
    "Aggarwal Medical Store\n" +
    "Shop no.-16, Block 20, Part 2, Trilokpuri, Delhi, 110091n" +
    "📞 +91 98765 43210",

  // ---- EDIT ME: Contact / fallback info ----
  contactInfo:
    "You can reach us at:\n📞 +91 98765 43210\n✉️ aggarwalmedicals@gmail.com\n\n" +
    "Or visit our Contact Us page for a support form",

  // Message shown when the bot doesn't understand the query at all
  fallback:
    "Sorry, I didn't quite get that. I can help with:\n" +
    "• Return policy\n• Shop timings & location\n• Basic info about common medicines\n\n" +
    "You can also check our FAQ page or Contact Us for anything else",

  // Message shown when a medicine name isn't in our basic list
  medicineNotFound:
    "I don't have information on that one yet — I currently only recognize a small list of common medicines " +
    "For anything else, please check with our pharmacist via Contact Us",

  // Shown while an openFDA lookup is in progress
  medicineLoading: "Let me look that up... 💊",

  // Shown if the openFDA API call fails/times out
  medicineApiError:
    "I found the medicine in our list, but couldn't fetch extra details right now (the lookup service may be unavailable). Please try again in a moment, or ask our pharmacist in-store.",

  // ---- Prescription reader (upload-a-photo flow) ----

  // Shown right after a prescription image is uploaded, while OCR runs
  prescriptionReading: "📄 Reading your prescription... this may take a few seconds.",

  // Shown if OCR couldn't extract any usable text from the image
  prescriptionNoText:
    "I couldn't read any text from that image. Please try again with a clearer, well-lit photo of the prescription.",

  // Shown if text was read but nothing on it looked like a medicine name
  prescriptionNoMatches:
    "I read the prescription but couldn't find any medicine names on it. Please check with our pharmacist via Contact Us, or type the medicine name directly.",

  // Shown if OCR itself throws (corrupt file, browser issue, etc.)
  prescriptionError:
    "Something went wrong while reading that prescription. Please try again with a clearer image, or type the medicine name instead.",
};

export type ChatbotConfig = typeof CHATBOT_CONFIG;