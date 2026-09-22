/**
 * ============================================================
 *  COMMON INDIAN MEDICINE BRANDS -> GENERIC / ACTIVE INGREDIENT
 * ============================================================
 * openFDA (api.fda.gov) only indexes US-approved drug labels,
 * so it has no data for Indian brand names like "Dolo 650" or
 * "Crocin". To still make use of openFDA, we keep a small local
 * map of common Indian OTC brand names -> their generic/active
 * ingredient, and then query openFDA using the GENERIC name.
 *
 * `openFdaTerm` is the term searched against openFDA's
 * `openfda.generic_name` field. If it's null, we skip the API
 * call (the item is a plain nutritional supplement/ORS that
 * isn't well represented in openFDA) and just show local info.
 *
 * Add more rows any time — this list is intentionally short and
 * only covers common OTC brands, not a full drug database.
 */

export interface MedicineEntry {
  /** Lowercase keywords a customer might type, matched with "contains" */
  keywords: string[];
  /** Friendly display name */
  displayName: string;
  /** Generic / active ingredient name */
  generic: string;
  /** Typical use, shown even if the API call fails */
  commonUse: string;
  /** Term to query against openFDA's openfda.generic_name field */
  openFdaTerm: string | null;
}

export const MEDICINE_DATABASE: MedicineEntry[] = [
  {
    keywords: ["dolo", "dolo 650", "dolo650"],
    displayName: "Dolo 650",
    generic: "Paracetamol (Acetaminophen) 650mg",
    commonUse: "fever and mild to moderate pain relief",
    openFdaTerm: "acetaminophen",
  },
  {
    keywords: ["crocin"],
    displayName: "Crocin",
    generic: "Paracetamol (Acetaminophen)",
    commonUse: "fever and pain relief",
    openFdaTerm: "acetaminophen",
  },
  {
    keywords: ["calpol"],
    displayName: "Calpol",
    generic: "Paracetamol (Acetaminophen) — pediatric syrup/tablet",
    commonUse: "fever and pain relief in children",
    openFdaTerm: "acetaminophen",
  },
  {
    keywords: ["combiflam"],
    displayName: "Combiflam",
    generic: "Ibuprofen + Paracetamol",
    commonUse: "pain relief and inflammation",
    openFdaTerm: "ibuprofen",
  },
  {
    keywords: ["disprin", "aspirin"],
    displayName: "Disprin",
    generic: "Aspirin",
    commonUse: "pain, fever, and (low dose) blood thinning",
    openFdaTerm: "aspirin",
  },
  {
    keywords: ["ecosprin"],
    displayName: "Ecosprin",
    generic: "Aspirin (low dose)",
    commonUse: "heart/cardiovascular protection, prescribed use",
    openFdaTerm: "aspirin",
  },
  {
    keywords: ["pan 40", "pan40", "pantop", "pantocid", "pantoprazole"],
    displayName: "Pan 40",
    generic: "Pantoprazole",
    commonUse: "acidity, acid reflux, and stomach ulcers",
    openFdaTerm: "pantoprazole",
  },
  {
    keywords: ["omez", "omeprazole"],
    displayName: "Omez",
    generic: "Omeprazole",
    commonUse: "acidity and acid reflux",
    openFdaTerm: "omeprazole",
  },
  {
    keywords: ["cetirizine", "cetzine", "alerid", "cetrizine"],
    displayName: "Cetirizine",
    generic: "Cetirizine",
    commonUse: "allergy relief (sneezing, runny nose, itching)",
    openFdaTerm: "cetirizine",
  },
  {
    keywords: ["levocetirizine", "levorid"],
    displayName: "Levocetirizine",
    generic: "Levocetirizine",
    commonUse: "allergy relief",
    openFdaTerm: "levocetirizine",
  },
  {
    keywords: ["avil"],
    displayName: "Avil",
    generic: "Pheniramine",
    commonUse: "allergy relief",
    openFdaTerm: null,
  },
  {
    keywords: ["azithral", "azee", "azithromycin"],
    displayName: "Azithral",
    generic: "Azithromycin",
    commonUse: "bacterial infections (antibiotic, prescription only)",
    openFdaTerm: "azithromycin",
  },
  {
    keywords: ["amoxyclav", "augmentin", "amoxicillin"],
    displayName: "Augmentin",
    generic: "Amoxicillin + Clavulanate",
    commonUse: "bacterial infections (antibiotic, prescription only)",
    openFdaTerm: "amoxicillin",
  },
  {
    keywords: ["metformin", "glycomet"],
    displayName: "Glycomet",
    generic: "Metformin",
    commonUse: "type 2 diabetes management (prescription only)",
    openFdaTerm: "metformin",
  },
  {
    keywords: ["volini", "moov", "diclofenac gel"],
    displayName: "Volini",
    generic: "Diclofenac (topical gel)",
    commonUse: "muscle and joint pain relief",
    openFdaTerm: "diclofenac",
  },
  {
    keywords: ["digene", "gelusil", "antacid"],
    displayName: "Digene",
    generic: "Antacid (Aluminium & Magnesium Hydroxide)",
    commonUse: "acidity and indigestion relief",
    openFdaTerm: "aluminum hydroxide",
  },
  {
    keywords: ["ors", "electral"],
    displayName: "Electral (ORS)",
    generic: "Oral Rehydration Salts",
    commonUse: "rehydration during diarrhea/vomiting/heat loss",
    openFdaTerm: null,
  },
  {
    keywords: ["vitamin c", "limcee", "celin"],
    displayName: "Limcee",
    generic: "Vitamin C (Ascorbic Acid)",
    commonUse: "immunity support, vitamin C supplementation",
    openFdaTerm: "ascorbic acid",
  },
  {
    keywords: ["vitamin d", "calcirol", "uprise d3", "d3"],
    displayName: "Calcirol",
    generic: "Vitamin D3 (Cholecalciferol)",
    commonUse: "vitamin D supplementation, bone health",
    openFdaTerm: "cholecalciferol",
  },
  {
    keywords: ["revital", "multivitamin"],
    displayName: "Revital",
    generic: "Multivitamin & Multimineral supplement",
    commonUse: "general nutrition and energy support",
    openFdaTerm: null,
  },
  {
    keywords: ["becosules", "b-complex", "b complex"],
    displayName: "Becosules",
    generic: "Vitamin B-Complex + Vitamin C",
    commonUse: "vitamin B supplementation",
    openFdaTerm: null,
  },
  {
    keywords: ["zincovit"],
    displayName: "Zincovit",
    generic: "Multivitamin + Zinc",
    commonUse: "immunity support, vitamin & zinc supplementation",
    openFdaTerm: null,
  },
  {
    keywords: ["rantac", "ranitidine"],
    displayName: "Rantac",
    generic: "Ranitidine",
    commonUse: "acidity relief (availability may vary by region)",
    openFdaTerm: "ranitidine",
  },
  {
    keywords: ["domstal", "domperidone"],
    displayName: "Domstal",
    generic: "Domperidone",
    commonUse: "nausea, vomiting, and indigestion relief",
    openFdaTerm: "domperidone",
  },
  {
    keywords: ["emeset", "ondansetron"],
    displayName: "Emeset",
    generic: "Ondansetron",
    commonUse: "nausea and vomiting relief (prescription only)",
    openFdaTerm: "ondansetron",
  },
  {
    keywords: ["betadine", "povidone iodine"],
    displayName: "Betadine",
    generic: "Povidone-Iodine (topical antiseptic)",
    commonUse: "wound cleaning and antisepsis",
    openFdaTerm: "povidone-iodine",
  },
  {
    keywords: ["zerodol", "aceclofenac"],
    displayName: "Zerodol",
    generic: "Aceclofenac",
    commonUse: "pain and inflammation relief",
    openFdaTerm: "aceclofenac",
  },
  {
    keywords: ["norflox", "ciplox", "ciprofloxacin", "norfloxacin"],
    displayName: "Norflox",
    generic: "Norfloxacin / Ciprofloxacin",
    commonUse: "bacterial infections (antibiotic, prescription only)",
    openFdaTerm: "ciprofloxacin",
  },
];

/** Finds the best matching medicine entry for free-text user input. */
export function findMedicineMatch(userText: string): MedicineEntry | null {
  const text = userText.toLowerCase().trim();
  if (!text) return null;

  // Prefer the longest keyword match so "pan 40" beats a shorter
  // accidental match, and sort candidates by keyword length descending.
  let best: { entry: MedicineEntry; length: number } | null = null;

  for (const entry of MEDICINE_DATABASE) {
    for (const kw of entry.keywords) {
      if (text.includes(kw)) {
        if (!best || kw.length > best.length) {
          best = { entry, length: kw.length };
        }
      }
    }
  }

  return best ? best.entry : null;
}
