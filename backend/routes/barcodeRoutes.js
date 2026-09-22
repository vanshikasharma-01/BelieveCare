const express = require("express");
const router = express.Router();

const {
    generateBarcode,
    saveBarcode
} = require("../controllers/barcodeController");

const {
    authenticateUser,
    authorizeRoles
} = require("../middleware/authMiddleware");

// Barcode generation/assignment is part of the Owner-only
// "add medicine" inventory flow, not a customer-facing feature.
router.get("/generate", authenticateUser, authorizeRoles("Owner"), generateBarcode);

router.put("/save", authenticateUser, authorizeRoles("Owner"), saveBarcode);

module.exports = router;
