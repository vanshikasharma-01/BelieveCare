/**
 * ============================================================
 *  PRESCRIPTION READER — OCR text -> inventory matching
 * ============================================================
 * The chatbot lets a customer upload a photo of a prescription.
 * Tesseract.js (client-side OCR) turns that image into raw text;
 * the helpers below turn that raw, noisy text into a list of
 * candidate medicine lines, and then try to match each line
 * against a real product in the store's inventory (by name,
 * brand, generic name, or salt/composition). If a line doesn't
 * match a real product directly, we fall back to the small local
 * brand -> generic map already used elsewhere in the chatbot
 * (chatbotMedicines.ts) so common brand names still resolve.
 *
 * Nothing here talks to the cart or the API directly — it just
 * turns text into { line, medicine } results. ChatbotWidget
 * decides what to do with each result (add to cart / out of
 * stock / not available).
 * ============================================================
 */

import type { Medicine } from "../../context/CartContext";
import { findMedicineMatch } from "./chatbotMedicines";

/** Words/labels commonly printed on prescriptions that are never
 * medicine names — used to drop obviously irrelevant OCR lines
 * before we try to match them against the inventory. */
const NOISE_STARTERS = [
  "dr", "dr.", "doctor", "patient", "name", "age", "sex", "gender",
  "male", "female", "date", "address", "diagnosis", "signature",
  "hospital", "clinic", "rx", "weight", "temp", "bp", "mobile",
  "phone", "contact", "regd", "reg no", "registration", "qualification",
  "mbbs", "md", "opd", "ip no", "uhid", "consultant", "department",
  "advice", "follow up", "next visit",
];

function normalize(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isLikelyNoiseLine(line: string): boolean {
  const norm = normalize(line);

  if (norm.length < 3) return true;
  if (/^\d+$/.test(norm)) return true;

  return NOISE_STARTERS.some(
    (w) => norm === w || norm.startsWith(`${w} `) || norm.startsWith(`${w}:`)
  );
}

// Common shorthand a prescription uses right before/after a drug name
// (dosage form, or a strength like "650mg"/"5ml"). A line carrying one
// of these is very likely a medicine line, even if we can't match it
// to anything in our inventory — which is what lets us tell "Tab.
// SomeUnstockedDrug 500mg" apart from plain instructions/notes.
const DRUG_LINE_MARKER =
  /\b(tab|tabs|tablet|cap|caps|capsule|syp|syrup|inj|injection|oint|ointment|cream|drop|drops|susp|suspension|gel|lotion)\b/i;
const DOSAGE_PATTERN = /\b\d+\s?(mg|ml|mcg|mg\/ml|g|iu)\b/i;

/** True if a (non-noise) line looks like it names a medicine, rather
 * than an instruction, symptom note, or other prescription text. Used
 * to decide whether an *unmatched* line is worth reporting as "not
 * available" instead of silently dropping it. */
function looksLikeMedicineLine(line: string): boolean {
  const norm = normalize(line);
  const wordCount = norm.split(" ").filter(Boolean).length;

  if (wordCount > 6) return false;
  if (DRUG_LINE_MARKER.test(norm)) return true;
  if (DOSAGE_PATTERN.test(norm)) return true;

  // No dosage/form marker — only treat short, mostly-alphabetic lines
  // (plausible bare brand names like "Dolo 650") as candidates.
  return wordCount <= 3;
}

/** Splits raw OCR output into cleaned, de-noised candidate lines. */
export function extractCandidateLines(ocrText: string): string[] {
  return ocrText
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0)
    .filter((l) => !isLikelyNoiseLine(l));
}

function inventorySearchFields(item: Medicine): string[] {
  const anyItem = item as unknown as Record<string, unknown>;

  return [
    item.name,
    item.brand,
    anyItem.genericName as string | undefined,
    item.salt,
    anyItem.saltComposition as string | undefined,
  ]
    .filter((f): f is string => !!f)
    .map((f) => normalize(f))
    .filter((f) => f.length >= 3);
}

/** Tries to find a real inventory product for one OCR'd line. */
function findInventoryMatch(line: string, inventory: Medicine[]): Medicine | null {
  const norm = normalize(line);
  if (norm.length < 3) return null;

  // 1) Direct match against the product's own name/brand/generic/salt.
  let best: { item: Medicine; score: number } | null = null;

  for (const item of inventory) {
    for (const field of inventorySearchFields(item)) {
      if (norm.includes(field) || field.includes(norm)) {
        const score = field.length;
        if (!best || score > best.score) {
          best = { item, score };
        }
      }
    }
  }

  if (best) return best.item;

  // 2) Fall back to the local brand -> generic map so common brand
  // names (e.g. "Dolo", "Crocin") still resolve to whatever the
  // store actually stocks under that generic/composition.
  const dbMatch = findMedicineMatch(norm);
  if (!dbMatch) return null;

  const genericNorm = normalize(dbMatch.generic.split("(")[0]);
  const brandNorm = normalize(dbMatch.displayName);

  for (const item of inventory) {
    const fields = inventorySearchFields(item);
    const isMatch = fields.some(
      (f) =>
        (genericNorm.length >= 3 && (f.includes(genericNorm) || genericNorm.includes(f))) ||
        (brandNorm.length >= 3 && f.includes(brandNorm))
    );
    if (isMatch) return item;
  }

  return null;
}

export interface PrescriptionLineResult {
  /** The cleaned OCR line the match (or non-match) came from. */
  line: string;
  /** The matched inventory product, or null if nothing matched. */
  medicine: Medicine | null;
}

/**
 * Turns raw OCR text into one result per candidate medicine line,
 * de-duplicating repeat matches of the same inventory item (a
 * prescription often repeats a name in a header and a dosage line).
 */
export function resolvePrescriptionMedicines(
  ocrText: string,
  inventory: Medicine[]
): PrescriptionLineResult[] {
  const lines = extractCandidateLines(ocrText);
  const results: PrescriptionLineResult[] = [];
  const seenMedicineIds = new Set<string>();

  for (const line of lines) {
    const medicine = findInventoryMatch(line, inventory);

    if (medicine) {
      if (seenMedicineIds.has(medicine._id)) continue;
      seenMedicineIds.add(medicine._id);
      results.push({ line, medicine });
      continue;
    }

    // Unmatched line: only surface it as "not available" if it
    // plausibly names a drug — otherwise it's likely an instruction,
    // symptom note, or other prescription text and would just be noise.
    if (looksLikeMedicineLine(line)) {
      results.push({ line, medicine: null });
    }
  }

  return results;
}
