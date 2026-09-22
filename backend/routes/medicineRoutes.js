const express = require("express");
const router = express.Router();

const {
    addMedicine,
    getMedicines,
    getMedicineById,
    updateMedicine,
    deleteMedicine,
    getLowStockMedicines,
    getExpiringMedicines,
    getInventorySummary,
    getMedicineByBarcode,
    getMedicinesByTripTag
} = require("../controllers/medicineController");

const {
    authenticateUser,
    authorizeRoles
} = require("../middleware/authMiddleware");


// Add medicine (Owner only)
router.post("/", authenticateUser, authorizeRoles("Owner"), addMedicine);


// Get all medicines
router.get("/", getMedicines);


// --- Owner dashboard alert routes ---
// NOTE: these must stay ABOVE "/:id" or Express will treat
// "low-stock" / "expiring" / "summary" as an :id value.

// Low stock / out of stock alerts
router.get(
    "/alerts/low-stock",
    authenticateUser,
    authorizeRoles("Owner"),
    getLowStockMedicines
);

// Expiry alerts
router.get(
    "/alerts/expiring",
    authenticateUser,
    authorizeRoles("Owner"),
    getExpiringMedicines
);

// Dashboard summary cards
router.get(
    "/summary",
    authenticateUser,
    authorizeRoles("Owner"),
    getInventorySummary
);


// Lookup by barcode (Owner only) — used by the scan-first add flow
router.get(
    "/barcode/:barcode",
    authenticateUser,
    authorizeRoles("Owner"),
    getMedicineByBarcode
);


// First Aid Kit — real, purchasable medicines tagged for a trip type
// (public, customers need this, not just owners)
router.get(
    "/trip/:tag",
    getMedicinesByTripTag
);


// Get one medicine
router.get("/:id", getMedicineById);


// Update medicine (Owner only)
router.put("/:id", authenticateUser, authorizeRoles("Owner"), updateMedicine);


// Delete medicine (Owner only)
router.delete("/:id", authenticateUser, authorizeRoles("Owner"), deleteMedicine);


module.exports = router;