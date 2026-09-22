// =================================================================
// Import the REAL store database (seed/inventory.csv) into MongoDB.
//
// This replaces seedFirstAidItems.js / importFirstAidCSV.js, which
// only inserted a handful of placeholder products. This script
// imports the full 122-product catalog exported from the owner's
// database, including the 20 "First Aid Supply" products that power
// the Customizable First Aid Kit feature (matched by `tags`, which
// becomes `tripTags` on the Inventory model).
//
// Safe to re-run: each row's Mongo `_id` (already present in the
// CSV) is preserved, so re-running this script UPDATES existing
// products in place instead of duplicating them. That also means
// any Cart/Order that already references one of these products by
// id keeps working after a re-import.
//
// Usage:
//   node seed/importInventoryCSV.js            (writes to MongoDB)
//   node seed/importInventoryCSV.js --dry       (parse + report only,
//                                                 no DB connection,
//                                                 no writes — use this
//                                                 to sanity-check the
//                                                 CSV after editing it)
// =================================================================

const fs = require("fs");
const path = require("path");

const DRY_RUN = process.argv.includes("--dry");

const CSV_PATH = path.join(__dirname, "inventory.csv");

/* =================================================================
   1. CSV parsing
   -----------------------------------------------------------------
   A full state-machine parser (not just line-splitting) because
   some fields (e.g. `description`) are quoted and may contain
   commas — a naive split(",") would break on those.
================================================================= */

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  // Normalize line endings so \r doesn't leak into the last field
  // of each row.
  const cleaned = text.replace(/\r\n/g, "\n");

  for (let i = 0; i < cleaned.length; i++) {
    const char = cleaned[i];

    if (inQuotes) {
      if (char === '"' && cleaned[i + 1] === '"') {
        field += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        field += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }

  // Last field/row (files don't always end with a trailing newline)
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  const header = rows[0];
  return rows
    .slice(1)
    .filter((r) => r.some((v) => v.trim() !== ""))
    .map((r) => {
      const obj = {};
      header.forEach((key, idx) => {
        obj[key] = r[idx] !== undefined ? r[idx].trim() : "";
      });
      return obj;
    });
}

/* =================================================================
   2. Field helpers
================================================================= */

// List-type fields in this CSV are inconsistently delimited
// depending on which part of the export they came from: "|" for the
// First Aid Supply rows, "; " or ", " (inside quoted fields) for the
// general medicine rows. Try the delimiters in order of how
// unambiguous they are.
function splitList(value) {
  if (!value) return [];

  if (value.includes("|")) {
    return value.split("|").map((v) => v.trim()).filter(Boolean);
  }
  if (value.includes(";")) {
    return value.split(";").map((v) => v.trim()).filter(Boolean);
  }
  if (value.includes(", ")) {
    return value.split(", ").map((v) => v.trim()).filter(Boolean);
  }

  return [value.trim()];
}

function toNumber(value, fallback = undefined) {
  if (value === undefined || value === null || value === "") return fallback;
  // Handles plain numbers and scientific notation like "8.90223E+12"
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

// The CSV's trip tags use a different vocabulary ("Mountain",
// "Roadtrip") than the rest of the app ("Mountains", "Road Trip" —
// the values the FirstAidKit.tsx <select> sends and that existing
// tripTags in the DB already use). Normalize so both line up.
const TRIP_TAG_MAP = {
  mountain: "Mountains",
  mountains: "Mountains",
  beach: "Beach",
  camping: "Camping",
  roadtrip: "Road Trip",
  "road trip": "Road Trip",
};

function normalizeTripTags(rawTags) {
  return splitList(rawTags)
    .map((tag) => TRIP_TAG_MAP[tag.trim().toLowerCase()] || tag.trim())
    .filter(Boolean);
}

const OBJECT_ID_RE = /^[0-9a-fA-F]{24}$/;

/* =================================================================
   3. Row -> Inventory document mapping
================================================================= */

function rowToDoc(row) {
  // uses: medicine rows split it across uses[0]/uses[1]; First Aid
  // Supply rows put it in one pipe-delimited "uses" column instead.
  const usesFromIndexed = [row["uses[0]"], row["uses[1]"]].filter(Boolean);
  const usesFromCombined = splitList(row["uses"]);
  const uses = usesFromCombined.length > 0 ? usesFromCombined : usesFromIndexed;

  const substitutes = [
    row["substitutes[0]"],
    row["substitutes[1]"],
    row["substitutes[2]"],
  ].filter(Boolean);

  // Two legacy/export-format columns exist for the same real fields
  // on a handful of rows (Men/Women/Children/Senior Citizen use
  // `bar_code` + `side_effects` instead of `barcode` + `sideEffects`).
  // Prefer the canonical field, fall back to the legacy one.
  const barcode = toNumber(row["barcode"]) ?? toNumber(row["bar_code"]);
  const sideEffects = row["sideEffects"]
    ? splitList(row["sideEffects"])
    : splitList(row["side_effects"]);

  const doc = {
    catalogId: toNumber(row["id"]),
    barcode,
    name: row["name"],
    genericName: row["genericName"] || undefined,
    brand: row["brand"],
    manufacturer: row["manufacturer"] || undefined,
    category: row["category"],
    subcategory: row["Subcategory"] || undefined,
    dosageForm: row["dosageForm"] || undefined,
    strength: row["strength"] || undefined,
    saltComposition: row["saltComposition"] || undefined,
    description: row["description"] || undefined,
    uses,
    dosage: row["dosage"] || undefined,
    sideEffects,
    warnings: splitList(row["warnings"]),
    suitableFor: splitList(row["suitable_for"]),
    price: toNumber(row["price"], 0),
    stock: toNumber(row["stock"], 0),
    expiry: row["expiry"] || undefined,
    image: row["image"] || undefined,
    substitutes,
    tripTags: normalizeTripTags(row["tags"]),
  };

  // Drop undefined keys so they don't overwrite existing values with
  // `undefined` on a re-import (Mongoose would otherwise unset them).
  Object.keys(doc).forEach((key) => {
    if (doc[key] === undefined) delete doc[key];
  });

  return doc;
}

/* =================================================================
   4. Main
================================================================= */

async function main() {
  const text = fs.readFileSync(CSV_PATH, "utf-8");
  const rows = parseCsv(text);

  const docs = rows.map((row) => ({ _id: row["_id"], row, doc: rowToDoc(row) }));

  // ---- Validation / warnings (shown in both dry and real runs) ----
  const warnings = [];

  docs.forEach(({ _id, doc }) => {
    if (!OBJECT_ID_RE.test(_id)) {
      warnings.push(`Row "${doc.name}": _id "${_id}" is not a valid 24-char ObjectId — will be auto-generated instead.`);
    }
    if (!doc.barcode) {
      warnings.push(`Row "${doc.name}" (catalogId ${doc.catalogId}): missing barcode.`);
    }
    if (!doc.price) {
      warnings.push(`Row "${doc.name}" (catalogId ${doc.catalogId}): missing price — set to 0, fix in the owner dashboard before selling.`);
    }
  });

  const tripTagCounts = {};
  docs.forEach(({ doc }) => {
    doc.tripTags.forEach((tag) => {
      tripTagCounts[tag] = (tripTagCounts[tag] || 0) + 1;
    });
  });

  console.log(`Parsed ${docs.length} rows from ${CSV_PATH}`);
  console.log("First Aid Kit trip-tag coverage:", tripTagCounts);
  if (warnings.length > 0) {
    console.log(`\n${warnings.length} warning(s):`);
    warnings.forEach((w) => console.log("  - " + w));
  }

  if (process.argv.includes("--sample")) {
    ["103", "87", "1"].forEach((catalogId) => {
      const match = docs.find((d) => String(d.doc.catalogId) === catalogId);
      console.log(`\nSample doc (catalogId ${catalogId}):`, JSON.stringify(match?.doc, null, 2));
    });
  }

  if (DRY_RUN) {
    console.log("\n--dry run: no database connection made, nothing written.");
    return;
  }

  // ---- Real run: connect and upsert ----
  require("dotenv").config();
  const mongoose = require("mongoose");
  const Inventory = require("../models/Inventory");

  await mongoose.connect(process.env.MONGO_URI);
  console.log("\nConnected to MongoDB");

  let inserted = 0;
  let updated = 0;

  for (const { _id, doc } of docs) {
    const useProvidedId = OBJECT_ID_RE.test(_id);

    const existing = useProvidedId
      ? await Inventory.findById(_id)
      : await Inventory.findOne({ catalogId: doc.catalogId });

    if (existing) {
      Object.assign(existing, doc);
      await existing.save();
      updated++;
    } else {
      await Inventory.create(useProvidedId ? { _id, ...doc } : doc);
      inserted++;
    }
  }

  console.log(`Done. Inserted ${inserted}, updated ${updated}.`);

  await mongoose.disconnect();
  process.exit(0);
}

main().catch((error) => {
  console.error("Import failed:", error);
  process.exit(1);
});