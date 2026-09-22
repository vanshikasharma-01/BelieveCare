const express = require("express");

const router = express.Router();

const {
  createOrder,
  getOrders,
  getCustomerOrders,
  updateOrderStatus,
  updatePaymentStatus,
} = require("../controllers/orderController");

const {
  authenticateUser,
  authorizeRoles,
} = require("../middleware/authMiddleware");

// Any logged-in customer can place an order for themselves.
// (customer id + totalAmount are derived server-side, never trusted
// from the request body — see orderController.createOrder)
router.post("/", authenticateUser, createOrder);

// All orders — staff only.
router.get("/", authenticateUser, authorizeRoles("Owner", "IT Staff"), getOrders);

// A specific customer's orders — the customer themself, or staff.
// Ownership is enforced inside the controller (getCustomerOrders),
// since a customer must only ever be able to see their own orders.
router.get("/customer/:userId", authenticateUser, getCustomerOrders);

// Update order status.
// Staff (Owner/IT Staff) can set any status. A customer may ALSO hit
// this route, but only to cancel their own order — enforced inside
// the controller, since authorizeRoles alone can't express "staff OR
// (customer + status === Cancelled + ownership)".
router.put(
  "/:id",
  authenticateUser,
  updateOrderStatus
);

// Update payment status (billing) — staff only. This must never be
// reachable by a customer, since it marks an order as paid.
router.put(
  "/:id/payment",
  authenticateUser,
  authorizeRoles("Owner", "IT Staff"),
  updatePaymentStatus
);

module.exports = router;
