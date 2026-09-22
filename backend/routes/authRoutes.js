const express = require("express");
const router = express.Router();

const { signup, login, getProfile, updateProfile, changePassword, addAddress, deleteAddress, forgotPassword, resetPassword, googleAuth, createStaffUser } = require("../controllers/authController");
const { authenticateUser, authorizeRoles } = require("../middleware/authMiddleware");

router.get("/", (req, res) => {
    res.send("Auth Route Working");
});

router.post("/signup", signup);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/google", googleAuth);

// Logged-in user's own profile
router.get("/me", authenticateUser, getProfile);
router.put("/me", authenticateUser, updateProfile);
router.put("/me/password", authenticateUser, changePassword);

// Saved addresses
router.post("/me/addresses", authenticateUser, addAddress);
router.delete("/me/addresses/:addressId", authenticateUser, deleteAddress);

// Owner-only: create a new Owner/IT Staff account. This is the ONLY
// legitimate way to create a non-Customer account — /signup always
// forces role to "Customer" to prevent privilege escalation.
router.post("/staff", authenticateUser, authorizeRoles("Owner"), createStaffUser);

module.exports = router;