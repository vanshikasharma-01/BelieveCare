const Order = require("../models/Order");
const Inventory = require("../models/Inventory");

// ===============================
// CREATE ORDER
// ===============================
const createOrder = async (req, res) => {

  try {

    const { medicines, address, paymentMethod } = req.body;

    // SECURITY: the customer is always the authenticated user, never
    // a value the client can supply — otherwise anyone could place an
    // order "as" someone else.
    const customer = req.user.id;

    if (!Array.isArray(medicines) || medicines.length === 0) {
      return res.status(400).json({
        message: "Order must include at least one item",
      });
    }

    const isOnlinePayment = paymentMethod === "Online Payment";

    // Build the real line items and total server-side from the
    // current Inventory prices. The client's totalAmount is never
    // trusted — otherwise a customer could submit any totalAmount
    // they like (e.g. 1) regardless of what's actually in the cart.
    const orderMedicines = [];
    let totalAmount = 0;

    for (const item of medicines) {

      const quantity = Number(item.quantity);

      if (!item.medicine || !Number.isFinite(quantity) || quantity <= 0) {
        return res.status(400).json({
          message: "Invalid order item",
        });
      }

      // Atomically check-and-decrement stock in a single operation so
      // two simultaneous orders can't both pass a stock check and
      // oversell the same item (a race condition the previous
      // check-then-update implementation was vulnerable to).
      const medicine = await Inventory.findOneAndUpdate(
        { _id: item.medicine, stock: { $gte: quantity } },
        { $inc: { stock: -quantity } },
        { new: true }
      );

      if (!medicine) {
        // Either the product doesn't exist, or there wasn't enough
        // stock. Roll back any decrements already applied earlier in
        // this same order before failing.
        await rollbackStock(orderMedicines);

        const exists = await Inventory.findById(item.medicine);
        return res.status(exists ? 400 : 404).json({
          message: exists
            ? `${exists.name} is out of stock`
            : "Product not found",
        });
      }

      orderMedicines.push({
        medicine: medicine._id,
        name: medicine.name,
        quantity,
        price: medicine.price,
      });

      totalAmount += medicine.price * quantity;
    }

    // Estimated delivery: 3 days from now, by default
    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 3);

    let order;

    try {
      order = new Order({
        customer,
        medicines: orderMedicines,
        totalAmount,
        address,
        paymentMethod,
        paymentStatus: isOnlinePayment ? "Paid" : "Pending",
        estimatedDelivery,
        statusHistory: [{ status: "Placed", changedAt: new Date() }],
      });

      await order.save();

    } catch (saveError) {
      // If order creation fails after stock was already decremented,
      // give the stock back rather than silently losing inventory.
      await rollbackStock(orderMedicines);
      throw saveError;
    }

    res.status(201).json({
      message: "Order placed successfully",
      order,
    });

  } catch (error) {

    console.log("ORDER ERROR:", error);

    res.status(500).json({
      message: error.message,
    });

  }

};

// Restore stock for items already decremented, used when an order
// fails partway through so inventory isn't silently lost.
async function rollbackStock(orderMedicines) {
  for (const item of orderMedicines) {
    await Inventory.findByIdAndUpdate(item.medicine, {
      $inc: { stock: item.quantity },
    });
  }
}

// ===============================
// GET ALL ORDERS (OWNER / IT STAFF)
// ===============================

const getOrders = async (req, res) => {

  try {

    const orders = await Order.find()
      .populate("customer")
      .populate("medicines.medicine");

    res.status(200).json(orders);

  } catch (error) {

    console.log("GET ORDERS ERROR:", error);

    res.status(500).json({
      message: error.message,
    });

  }

};

// ===============================
// GET CUSTOMER ORDERS
// ===============================

const getCustomerOrders = async (req, res) => {

  try {

    const isStaff = ["Owner", "IT Staff"].includes(req.user.role);
    const isSelf = req.user.id === req.params.userId;

    // SECURITY: a customer may only ever fetch their own orders.
    // Staff can look up any customer's orders.
    if (!isStaff && !isSelf) {
      return res.status(403).json({
        message: "You are not authorized to view these orders",
      });
    }

    const orders = await Order.find({
      customer: req.params.userId,
    })
      .populate("medicines.medicine")
      .populate("customer");

    res.status(200).json(orders);

  } catch (error) {

    console.log("CUSTOMER ORDERS ERROR:", error);

    res.status(500).json({
      message: error.message,
    });

  }

};

// ===============================
// UPDATE ORDER STATUS (OWNER / IT STAFF)
// ===============================

const updateOrderStatus = async (req, res) => {

  try {

    const { status } = req.body;
    const isStaff = ["Owner", "IT Staff"].includes(req.user.role);

    const existing = await Order.findById(req.params.id);

    if (!existing) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    if (!isStaff) {
      // A customer (non-staff) hitting this route may only cancel
      // their own order — never set any other status, and never
      // touch someone else's order.
      const isOwnOrder = existing.customer.toString() === req.user.id;

      if (!isOwnOrder) {
        return res.status(403).json({
          message: "You are not authorized to update this order",
        });
      }

      if (status !== "Cancelled") {
        return res.status(403).json({
          message: "You are only allowed to cancel your own order",
        });
      }

      if (["Delivered", "Cancelled"].includes(existing.orderStatus)) {
        return res.status(400).json({
          message: `This order can no longer be cancelled (already ${existing.orderStatus}).`,
        });
      }
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        orderStatus: status,
        $push: {
          statusHistory: {
            status,
            changedAt: new Date(),
          },
        },
      },
      {
        new: true,
      }
    );

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    res.status(200).json(order);

  } catch (error) {

    console.log("UPDATE ORDER ERROR:", error);

    res.status(500).json({
      message: error.message,
    });

  }

};

// ===============================
// UPDATE PAYMENT STATUS (OWNER / IT STAFF — BILLING)
// ===============================

const updatePaymentStatus = async (req, res) => {

  try {

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        paymentStatus: req.body.paymentStatus,
      },
      {
        new: true,
      }
    );

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    res.status(200).json(order);

  } catch (error) {

    console.log("UPDATE PAYMENT ERROR:", error);

    res.status(500).json({
      message: error.message,
    });

  }

};

module.exports = {
  createOrder,
  getOrders,
  getCustomerOrders,
  updateOrderStatus,
  updatePaymentStatus,
};
