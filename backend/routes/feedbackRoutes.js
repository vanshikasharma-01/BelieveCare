const express = require("express");
const router = express.Router();

const {
  submitFeedback,
  getFeedbackForOrder,
  getAllFeedback,
} = require("../controllers/feedbackController");

const {
  authenticateUser,
  authorizeRoles,
} = require("../middleware/authMiddleware");

// A logged-in customer submits feedback for their own order.
router.post("/", authenticateUser, submitFeedback);

// Staff-only: view all feedback across every order/customer.
router.get("/", authenticateUser, authorizeRoles("Owner", "IT Staff"), getAllFeedback);

// Feedback for one order — the order's own customer, or staff.
// Ownership is enforced inside the controller.
router.get("/order/:orderId", authenticateUser, getFeedbackForOrder);

module.exports = router;
