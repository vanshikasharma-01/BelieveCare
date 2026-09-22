/**
 * =============================================================
 * First Aid Kit — Rule-Based Recommendation Engine
 * =============================================================
 *
 * 100% deterministic, hardcoded formulas. No AI, no ML, no external
 * API calls, no randomness. Every function here is a pure function:
 * same inputs always produce the same output.
 *
 * The engine depends on exactly two inputs — number of travellers
 * and number of travel days — per the product spec. Each item type
 * has its own quantity formula (below), and a subset of them are
 * additionally scaled by a travel-duration multiplier.
 *
 * To change a formula later: edit the matching function below (or
 * its bracket table). To add a new item type: add a new formula
 * function, then register it in `KIT_ITEM_DEFINITIONS`. Nothing
 * else in the app needs to change — the recommendation summary UI
 * renders whatever `KIT_ITEM_DEFINITIONS` contains.
 */

/* =============================================================
   Travel-days multiplier
   =============================================================
   Applies ONLY to medicine-type items (tablets, capsules, syrup,
   ointment/gel/cream, spray) — never to bandages, masks, gloves,
   cotton rolls, gauze pads, hand sanitizer, or ORS (ORS already has
   its own day-dependent formula, so it's intentionally excluded
   here to avoid double-scaling with days).
============================================================= */

interface MultiplierBracket {
  maxDays: number;
  multiplier: number;
}

// Ordered ascending by maxDays — the first bracket whose maxDays the
// trip length fits under wins.
const TRAVEL_DAYS_MULTIPLIER_BRACKETS: MultiplierBracket[] = [
  { maxDays: 3, multiplier: 1 },
  { maxDays: 7, multiplier: 1.5 },
  { maxDays: 14, multiplier: 2 },
  { maxDays: 30, multiplier: 3 },
];

/**
 * 1-3 days   → ×1
 * 4-7 days   → ×1.5
 * 8-14 days  → ×2
 * 15-30 days → ×3
 * 30+ days   → stays at ×3 (highest defined bracket; no formula was
 *              given beyond 30 days, so it deliberately does not
 *              keep climbing on its own).
 */
export function getTravelDaysMultiplier(days: number): number {
  if (days <= 0) return 1;

  const bracket = TRAVEL_DAYS_MULTIPLIER_BRACKETS.find((b) => days <= b.maxDays);

  return bracket
    ? bracket.multiplier
    : TRAVEL_DAYS_MULTIPLIER_BRACKETS[TRAVEL_DAYS_MULTIPLIER_BRACKETS.length - 1].multiplier;
}

/* =============================================================
   Per-item base formulas (before the travel-days multiplier)
============================================================= */

/** Tablets / Capsules — 1 strip per 10 travellers. */
export function getTabletCapsuleStrips(people: number): number {
  return Math.ceil(people / 10);
}

/** Spray — 1 bottle per 50 travellers. */
export function getSprayCount(people: number): number {
  return Math.ceil(people / 50);
}

/** Ointment / Gel / Cream — 1 tube per 25 travellers. */
export function getOintmentTubes(people: number): number {
  return Math.ceil(people / 25);
}

/** Syrup — 1 bottle per 15 travellers. */
export function getSyrupBottles(people: number): number {
  return Math.ceil(people / 15);
}

interface FixedBracket {
  maxPeople: number;
  quantity: number;
}

// Bandages follow a fixed lookup table, not a division formula.
const BANDAGE_BRACKETS: FixedBracket[] = [
  { maxPeople: 3, quantity: 5 },
  { maxPeople: 20, quantity: 10 },
  { maxPeople: 40, quantity: 20 },
  { maxPeople: 60, quantity: 30 },
  { maxPeople: 80, quantity: 40 },
  { maxPeople: 100, quantity: 50 },
];

/**
 * Bandages — fixed brackets:
 * 1-3 → 5, 4-20 → 10, 21-40 → 20, 41-60 → 30, 61-80 → 40, 81-100 → 50.
 *
 * Beyond 100 people (undocumented range): extends the same step
 * pattern seen in the table (+10 bandages per +20 people) rather
 * than silently capping at 50 — still a fixed, deterministic rule,
 * just applied past the given examples.
 */
export function getBandageCount(people: number): number {
  const bracket = BANDAGE_BRACKETS.find((b) => people <= b.maxPeople);
  if (bracket) return bracket.quantity;

  const extraPeople = people - 100;
  const extraSteps = Math.ceil(extraPeople / 20);
  return 50 + extraSteps * 10;
}

/** Gauze Pads — 5 pads per 10 travellers. */
export function getGauzePads(people: number): number {
  return Math.ceil(people / 10) * 5;
}

/** Cotton Roll — 1 roll per 20 travellers. */
export function getCottonRolls(people: number): number {
  return Math.ceil(people / 20);
}

/** Hand Sanitizer — 1 bottle per 10 travellers. */
export function getHandSanitizerBottles(people: number): number {
  return Math.ceil(people / 10);
}

/** Face Masks — 2 masks per traveller. */
export function getFaceMasks(people: number): number {
  return people * 2;
}

/** Gloves — 1 pair per 5 travellers. */
export function getGlovePairs(people: number): number {
  return Math.ceil(people / 5);
}

/**
 * ORS — 1 sachet per traveller for every 2 travel days.
 * people × ceil(days / 2)
 * e.g. 5 people, 6 days → 5 × ceil(6/2) = 5 × 3 = 15 sachets.
 */
export function getOrsSachets(people: number, days: number): number {
  return people * Math.ceil(days / 2);
}

/* =============================================================
   Item registry — the single source of truth the UI renders from.
   Add/remove/edit an item here and the recommendation summary
   updates automatically; no other file needs to change.
============================================================= */

export interface KitItemDefinition {
  key: string;
  label: string;
  unit: string;
  // Whether the travel-days multiplier applies to this item.
  appliesMultiplier: boolean;
  calculateBaseQuantity: (people: number, days: number) => number;
}

export const KIT_ITEM_DEFINITIONS: KitItemDefinition[] = [
  {
    key: "tabletsCapsules",
    label: "Tablets / Capsules",
    unit: "strip(s)",
    appliesMultiplier: true,
    calculateBaseQuantity: (people) => getTabletCapsuleStrips(people),
  },
  {
    key: "syrup",
    label: "Syrup",
    unit: "bottle(s)",
    appliesMultiplier: true,
    calculateBaseQuantity: (people) => getSyrupBottles(people),
  },
  {
    key: "ointmentGelCream",
    label: "Ointment / Gel / Cream",
    unit: "tube(s)",
    appliesMultiplier: true,
    calculateBaseQuantity: (people) => getOintmentTubes(people),
  },
  {
    key: "spray",
    label: "Spray",
    unit: "bottle(s)",
    appliesMultiplier: true,
    calculateBaseQuantity: (people) => getSprayCount(people),
  },
  {
    key: "bandages",
    label: "Bandages",
    unit: "piece(s)",
    appliesMultiplier: false,
    calculateBaseQuantity: (people) => getBandageCount(people),
  },
  {
    key: "gauzePads",
    label: "Gauze Pads",
    unit: "pad(s)",
    appliesMultiplier: false,
    calculateBaseQuantity: (people) => getGauzePads(people),
  },
  {
    key: "cottonRoll",
    label: "Cotton Roll",
    unit: "roll(s)",
    appliesMultiplier: false,
    calculateBaseQuantity: (people) => getCottonRolls(people),
  },
  {
    key: "handSanitizer",
    label: "Hand Sanitizer",
    unit: "bottle(s)",
    appliesMultiplier: false,
    calculateBaseQuantity: (people) => getHandSanitizerBottles(people),
  },
  {
    key: "faceMasks",
    label: "Face Masks",
    unit: "mask(s)",
    appliesMultiplier: false,
    calculateBaseQuantity: (people) => getFaceMasks(people),
  },
  {
    key: "gloves",
    label: "Gloves",
    unit: "pair(s)",
    appliesMultiplier: false,
    calculateBaseQuantity: (people) => getGlovePairs(people),
  },
  {
    key: "ors",
    label: "ORS Sachets",
    unit: "sachet(s)",
    // Excluded on purpose — ORS already scales with `days` via its
    // own formula above, so applying the multiplier too would
    // double-count trip duration.
    appliesMultiplier: false,
    calculateBaseQuantity: (people, days) => getOrsSachets(people, days),
  },
];

/* =============================================================
   Master calculator
============================================================= */

export interface KitRecommendationItem {
  key: string;
  label: string;
  unit: string;
  baseQuantity: number;
  multiplierApplied: number;
  finalQuantity: number;
}

export interface FirstAidKitRecommendation {
  people: number;
  days: number;
  travelDaysMultiplier: number;
  items: KitRecommendationItem[];
}

/**
 * Runs every registered formula for the given group size and trip
 * length, applying the travel-days multiplier only to the items
 * flagged for it. Pure and deterministic — call it as often as you
 * like (e.g. on every keystroke) with no side effects.
 */
export function calculateFirstAidKitRecommendation(
  people: number,
  days: number
): FirstAidKitRecommendation {
  const safePeople = Number.isFinite(people) && people > 0 ? Math.floor(people) : 0;
  const safeDays = Number.isFinite(days) && days > 0 ? Math.floor(days) : 0;

  const travelDaysMultiplier = getTravelDaysMultiplier(safeDays);

  const items: KitRecommendationItem[] = KIT_ITEM_DEFINITIONS.map((definition) => {
    if (safePeople === 0) {
      return {
        key: definition.key,
        label: definition.label,
        unit: definition.unit,
        baseQuantity: 0,
        multiplierApplied: 1,
        finalQuantity: 0,
      };
    }

    const baseQuantity = definition.calculateBaseQuantity(safePeople, safeDays);
    const multiplierApplied = definition.appliesMultiplier ? travelDaysMultiplier : 1;
    const finalQuantity = Math.ceil(baseQuantity * multiplierApplied);

    return {
      key: definition.key,
      label: definition.label,
      unit: definition.unit,
      baseQuantity,
      multiplierApplied,
      finalQuantity,
    };
  });

  return {
    people: safePeople,
    days: safeDays,
    travelDaysMultiplier,
    items,
  };
}

/* =============================================================
   Optional helper for matching against real catalog items later —
   maps a medicine's `dosageForm` field to the matching quantity
   formula (with the multiplier already applied). Not required by
   the summary UI, but handy if you later want to auto-fill
   quantities for real stocked products by their dosage form.
============================================================= */
export function getQuantityForDosageForm(
  dosageForm: string,
  people: number,
  days: number
): number {
  if (people <= 0) return 0;

  const multiplier = getTravelDaysMultiplier(days);

  // Normalize so "Tablet/Capsule", "Cream/Lotion", extra spacing,
  // etc. (as they appear in the real inventory export) match the
  // same branch as the simple single-word forms.
  const form = dosageForm.trim().toLowerCase();

  const isAny = (...candidates: string[]) =>
    candidates.some((c) => form === c || form.includes(c));

  // --- Medicine-type forms: scaled by both people AND trip length ---

  if (isAny("tablet", "capsule", "chewable tablet", "tablet/capsule")) {
    return Math.ceil(getTabletCapsuleStrips(people) * multiplier);
  }

  if (isAny("syrup", "liquid")) {
    return Math.ceil(getSyrupBottles(people) * multiplier);
  }

  if (isAny("ointment", "gel", "cream", "lotion")) {
    return Math.ceil(getOintmentTubes(people) * multiplier);
  }

  if (isAny("spray")) {
    return Math.ceil(getSprayCount(people) * multiplier);
  }

  if (isAny("drop")) {
    // Eye/ear/nasal/oral drops — same bottle ratio as a syrup.
    return Math.ceil(getSyrupBottles(people) * multiplier);
  }

  // --- Supply-type forms: scaled by people only (no trip-length
  //     multiplier — a longer trip doesn't need more bandages) ---

  if (isAny("bandage strip", "roller bandage", "bandage")) {
    return getBandageCount(people);
  }

  // --- Rehydration powder — already scales with days via its own
  //     formula, so the multiplier is deliberately not applied on
  //     top of it (would double-count trip length). ---

  if (isAny("powder sachet", "powder")) {
    return getOrsSachets(people, days);
  }

  // --- Shared equipment (thermometer, oximeter, etc.) — one kit
  //     generally needs one, with a spare per larger group rather
  //     than one per traveller. ---

  if (isAny("device")) {
    return Math.max(1, Math.ceil(people / 20));
  }

  // No explicit rule was given for other dosage forms (injection,
  // other) — default to the tablet/capsule ratio scaled by the
  // multiplier. Add a dedicated `if` above whenever a real formula
  // for one of these is decided.
  return Math.ceil(getTabletCapsuleStrips(people) * multiplier);
}
