const mongoose = require("mongoose");

// ===============================================================
// Inventory model
// Renamed from "Medicine" -> "Inventory" because this collection
// holds every product sold in the store (medicines, wellness,
// cosmetics, medical tools, etc.), not just medicines.
//
// Field set matches the store's catalog data format so records can
// be imported directly (description/uses/dosage/sideEffects/warnings
// power the customer-facing "Additional Information" section, and
// substitutes powers the "Suggest Substitute" feature).
// ===============================================================
const inventorySchema = new mongoose.Schema(
  {
    // Optional external catalog id (useful when bulk-importing data
    // that already has its own numeric ids). Not used as the primary
    // key — Mongo's _id remains the real identifier.
    catalogId: {
      type: Number,
    },

    barcode: {
      type: String,
    },

    name: {
      type: String,
      required: true,
    },

    genericName: {
      type: String,
    },

    brand: {
      type: String,
      required: true,
    },

    manufacturer: {
      type: String,
    },

    category: {
      type: String,
      required: true,
    },

    subcategory: {
      type: String,
    },

    dosageForm: {
      type: String,
    },

    strength: {
      type: String,
    },

    // Kept for backwards compatibility with existing records/forms
    // that only store a short salt string (e.g. "Paracetamol 650mg").
    salt: {
      type: String,
    },

    // Full salt composition string, e.g. "Paracetamol (650mg)".
    saltComposition: {
      type: String,
    },

    description: {
      type: String,
    },

    // Hindi translation of `description`. Optional — falls back to
    // the English `description` on the frontend when not set.
    descriptionHi: {
      type: String,
    },

    uses: {
      type: [String],
      default: [],
    },

    usesHi: {
      type: [String],
      default: [],
    },

    dosage: {
      type: String,
    },

    dosageHi: {
      type: String,
    },

    sideEffects: {
      type: [String],
      default: [],
    },

    sideEffectsHi: {
      type: [String],
      default: [],
    },

    warnings: {
      type: [String],
      default: [],
    },

    warningsHi: {
      type: [String],
      default: [],
    },

    // Cosmetics-only: who/what the product is suited for (e.g. "Oily
    // Skin", "All Skin Types", "Men").
    suitableFor: {
      type: [String],
      default: [],
    },

    prescriptionRequired: {
      type: Boolean,
      default: false,
    },

    price: {
      type: Number,
      required: true,
    },

    stock: {
      type: Number,
      required: true,
      default: 0,
    },

    expiry: {
      type: String,
    },

    image: {
      type: String,
    },

    // Names of other catalog products that can substitute this one
    // (e.g. same salt composition). Stored directly as product names
    // so the "Suggest Substitute" feature doesn't need a separate
    // lookup table.
    substitutes: {
      type: [String],
      default: [],
    },

    // Used to tag items suitable for specific trip types (Mountains,
    // Beach, Camping, Road Trip) so the First Aid Kit feature can pull
    // real, purchasable products instead of fake mock data.
    tripTags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Inventory", inventorySchema);
