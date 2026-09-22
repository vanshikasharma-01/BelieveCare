const Feedback = require("../models/Feedback");
const Order = require("../models/Order");
const User = require("../models/user");

// ===============================
// SUBMIT FEEDBACK FOR AN ORDER
// ===============================
const submitFeedback = async (req, res) => {
  try {
    const { order, rating, message } = req.body;

    // SECURITY: the customer is always the authenticated user, never
    // a value the client can supply — otherwise anyone could post
    // feedback pretending to be a different customer.
    const customer = req.user.id;

    if (!order || !rating) {
      return res.status(400).json({
        success: false,
        message: "order and rating are required",
      });
    }

    const existingOrder = await Order.findById(order);

    if (!existingOrder) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // A customer may only leave feedback on their own order.
    const isStaff = ["Owner", "IT Staff"].includes(req.user.role);
    if (!isStaff && existingOrder.customer.toString() !== customer) {
      return res.status(403).json({
        success: false,
        message: "You can only leave feedback on your own orders",
      });
    }

    // One feedback per order — if it already exists, update it instead
    // of creating a duplicate.
    let feedback = await Feedback.findOne({ order });

    if (feedback) {
      feedback.rating = rating;
      feedback.message = message || "";
      await feedback.save();
    } else {
      feedback = await Feedback.create({
        order,
        customer,
        rating,
        message: message || "",
      });
    }

    res.status(201).json({
      success: true,
      message: "Thank you for your feedback!",
      feedback,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===============================
// GET FEEDBACK FOR A SPECIFIC ORDER
// ===============================
const getFeedbackForOrder = async (req, res) => {
  try {

    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // A customer may only view feedback for their own order.
    const isStaff = ["Owner", "IT Staff"].includes(req.user.role);
    if (!isStaff && order.customer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view this feedback",
      });
    }

    const feedback = await Feedback.findOne({ order: req.params.orderId });

    res.status(200).json({
      success: true,
      feedback: feedback || null,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===============================
// GET ALL FEEDBACK (OWNER / IT STAFF)
// ===============================
const getAllFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.find()
      .populate({ path: "customer", select: "name email", model: User })
      .populate({ path: "order", model: Order })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      feedback,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  submitFeedback,
  getFeedbackForOrder,
  getAllFeedback,
};
