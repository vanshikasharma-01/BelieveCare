import { useContext, useState } from "react";
import { CartContext } from "../context/CartContext";
import FeedbackModal from "./FeedbackModal";
import ConfirmDialog from "./ConfirmDialog";
import { updateOrderStatus } from "../api/orderApi";
import { getMedicineById } from "../api/medicineApi";
import { useToast } from "../context/ToastContext";

import "../styles/order.css";

interface StatusHistoryEntry {
  status: string;
  changedAt: string;
}

interface OrderMedicineLine {
  // The backend populates this into the full Inventory document when
  // fetching order history — it is NOT a plain ID string at that
  // point, even though it's stored as one. Handle both shapes so
  // reorder keeps working if that ever changes back.
  medicine: string | { _id: string };
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  _id: string;
  createdAt: string;
  totalAmount: number;
  medicines: OrderMedicineLine[];
  orderStatus: string;
  address: string;
  paymentMethod: string;
  statusHistory?: StatusHistoryEntry[];
  estimatedDelivery?: string;
}

interface OrderCardProps {
  order: Order;
}

const statusColors: Record<string, string> = {
  Placed: "#2196F3",
  Packed: "#9C27B0",
  Shipped: "#FF9800",
  "Out For Delivery": "#FFC107",
  Delivered: "#4CAF50",
  Cancelled: "#dc3545",
};

// The delivery journey shown in the tracker. Cancelled orders are
// rendered separately since they don't follow this linear path.
const TRACKER_STAGES = [
  "Placed",
  "Packed",
  "Shipped",
  "Out For Delivery",
  "Delivered",
];

function DeliveryTracker({ order }: { order: Order }) {
  if (order.orderStatus === "Cancelled") {
    return (
      <div className="delivery-tracker delivery-tracker-cancelled">
        <span className="tracker-cancelled-icon">✕</span>
        <span>This order was cancelled.</span>
      </div>
    );
  }

  const currentIndex = TRACKER_STAGES.indexOf(order.orderStatus);

  const historyFor = (stage: string) =>
    order.statusHistory?.find((entry) => entry.status === stage);

  return (
    <div className="delivery-tracker">
      {TRACKER_STAGES.map((stage, index) => {
        const reached = index <= currentIndex;
        const entry = historyFor(stage);

        return (
          <div
            className={
              "tracker-step" + (reached ? " reached" : "")
            }
            key={stage}
          >
            <div className="tracker-step-marker">
              <span className="tracker-step-dot">
                {reached ? "✓" : index + 1}
              </span>
              {index < TRACKER_STAGES.length - 1 && (
                <span
                  className={
                    "tracker-step-line" +
                    (index < currentIndex ? " reached" : "")
                  }
                />
              )}
            </div>

            <div className="tracker-step-label">
              <span>{stage}</span>
              {entry && (
                <span className="tracker-step-time">
                  {new Date(entry.changedAt).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function OrderCard({ order }: OrderCardProps) {

  const { addMultipleToCart } = useContext(CartContext);
  const { showToast } = useToast();
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [orderStatus, setOrderStatus] = useState(order.orderStatus);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const handleCancelClick = () => {
    setShowCancelConfirm(true);
  };

  const handleCancelConfirm = async () => {
    setShowCancelConfirm(false);

    try {
      setCancelling(true);
      await updateOrderStatus(order._id, "Cancelled");
      setOrderStatus("Cancelled");
      showToast("Order cancelled successfully.", "success");
    } catch (err: any) {
      console.error("Failed to cancel order:", err);
      showToast(
        err?.response?.data?.message ||
          "Could not cancel this order. Please try again.",
        "error"
      );
    } finally {
      setCancelling(false);
    }
  };

  const [reordering, setReordering] = useState(false);

  const handleReorder = async () => {
    setReordering(true);

    let unavailableCount = 0;
    const requests: { product: any; quantity: number }[] = [];

    for (const item of order.medicines) {
      const medicineId =
        typeof item.medicine === "string" ? item.medicine : item.medicine?._id;

      if (!medicineId) {
        unavailableCount++;
        continue;
      }

      let live: any = null;

      try {
        live = await getMedicineById(medicineId);
      } catch {
        // Medicine no longer exists in the catalog (deleted since
        // this order was placed).
        unavailableCount++;
        continue;
      }

      if (!live || live.stock <= 0) {
        unavailableCount++;
        continue;
      }

      // Re-add using the medicine's CURRENT stock/price/etc — never
      // the stale values captured on the original order — so the
      // out-of-stock protections in CartContext see real data.
      requests.push({
        product: {
          _id: live._id,
          name: live.name,
          price: live.price,
          brand: live.brand || "",
          category: live.category || "",
          salt: live.salt || live.saltComposition || "",
          stock: live.stock,
          expiry: live.expiry || "",
        },
        quantity: item.quantity || 1,
      });
    }

    // Add everything in a single state update instead of calling
    // addToCart once per item in a loop — looping a React state
    // setter like that only ever keeps the effect of the last call.
    const { addedCount } = addMultipleToCart(requests);

    setReordering(false);

    if (addedCount > 0) {
      showToast(
        unavailableCount > 0
          ? `Added ${addedCount} item(s) to your cart. ${unavailableCount} item(s) are no longer available or out of stock.`
          : "Items from this order have been added to your cart.",
        unavailableCount > 0 ? "info" : "success"
      );
    } else if (unavailableCount > 0) {
      showToast("None of these items are currently available.", "error");
    }
  };

  return (
    <div className="order-card">

      <div className="order-card-header">
        <h2>Order #{order._id.slice(-6).toUpperCase()}</h2>

        <span
          className="order-status-badge"
          style={{
            background: statusColors[orderStatus] || "#999",
          }}
        >
          {orderStatus}
        </span>
      </div>

      <p>Date: {new Date(order.createdAt).toLocaleDateString()}</p>

      {order.estimatedDelivery && orderStatus !== "Delivered" && orderStatus !== "Cancelled" && (
        <p className="order-eta">
          📦 Estimated delivery:{" "}
          {new Date(order.estimatedDelivery).toLocaleDateString(undefined, {
            weekday: "short",
            month: "short",
            day: "numeric",
          })}
        </p>
      )}

      <p>Delivery Address: {order.address}</p>

      <p>Payment: {order.paymentMethod}</p>

      <DeliveryTracker order={{ ...order, orderStatus }} />

      <h3>Items</h3>

      <ul>
        {order.medicines.map((item, index) => (
          <li key={index}>
            {item.name} × {item.quantity} — ₹{item.price * item.quantity}
          </li>
        ))}
      </ul>

      <h3>Total: ₹{order.totalAmount}</h3>

      <div className="order-card-actions">
        <button onClick={handleReorder} disabled={reordering}>
          {reordering ? "Checking availability..." : "Reorder"}
        </button>

        {orderStatus !== "Delivered" && orderStatus !== "Cancelled" && (
          <button
            className="order-cancel-btn"
            onClick={handleCancelClick}
            disabled={cancelling}
          >
            {cancelling ? "Cancelling..." : "Cancel Order"}
          </button>
        )}

        {orderStatus === "Delivered" && (
          <button
            className="order-feedback-btn"
            onClick={() => setShowFeedback(true)}
            disabled={feedbackSent}
          >
            {feedbackSent ? "✓ Feedback Sent" : "Send Feedback"}
          </button>
        )}
      </div>

      {showFeedback && (
        <FeedbackModal
          orderId={order._id}
          onClose={() => setShowFeedback(false)}
          onSubmitted={() => setFeedbackSent(true)}
        />
      )}

      {showCancelConfirm && (
        <ConfirmDialog
          message="Do you want to cancel this order?"
          onConfirm={handleCancelConfirm}
          onCancel={() => setShowCancelConfirm(false)}
        />
      )}

    </div>
  );
}

export default OrderCard;