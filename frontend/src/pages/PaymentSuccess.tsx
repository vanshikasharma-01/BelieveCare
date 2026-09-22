import { Link, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import "../styles/paymentsuccess.css";

interface PaymentSuccessState {
  orderId?: string;
  amount?: number;
  paymentMethod?: string;
}

function PaymentSuccess() {
  const location = useLocation();
  const state = (location.state || {}) as PaymentSuccessState;

  const isCod = state.paymentMethod === "Cash on Delivery";

  // Falls back to a locally-generated reference only if this page was
  // opened directly (e.g. a stale bookmark) without a real order behind it.
  const orderId = state.orderId
    ? "#" + state.orderId.slice(-6).toUpperCase()
    : "BLV" + Math.floor(Math.random() * 1000000);

  return (
    <>
      <Navbar />

      <div className="payment-container">
        <div className="payment-card">
          <div className="success-icon">✅</div>

          <h1>{isCod ? "Order Successful" : "Payment Successful"}</h1>

          <p>
            Thank you for shopping with <strong>Believecare</strong>.
          </p>

          <div className="order-details">
            <p>
              <strong>Order ID:</strong> {orderId}
            </p>

            {state.amount !== undefined && (
              <p>
                <strong>{isCod ? "Amount To Be Paid:" : "Amount Paid:"}</strong> ₹{state.amount}
              </p>
            )}

            {state.paymentMethod && (
              <p>
                <strong>Payment Method:</strong> {state.paymentMethod}
              </p>
            )}

            <p>
              <strong>Estimated Delivery:</strong> 2-3 Days
            </p>
          </div>

          <Link to="/orders">
            <button className="continue-btn">View My Orders</button>
          </Link>

          <Link to="/home">
            <button className="continue-btn" style={{ marginTop: 10 }}>
              Continue Shopping
            </button>
          </Link>
        </div>
      </div>
    </>
  );
}

export default PaymentSuccess;
