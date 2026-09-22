import { useState } from "react";
import { forgotPasswordApi } from "../api/authApi";
import "../styles/forgotPasswordModal.css";

interface ForgotPasswordModalProps {
  onClose: () => void;
}

function ForgotPasswordModal({ onClose }: ForgotPasswordModalProps) {

  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const handleSubmit = async () => {

    if (!email) {
      setIsError(true);
      setMessage("Please enter your email.");
      return;
    }

    try {
      setSending(true);
      setIsError(false);

      const response = await forgotPasswordApi(email);

      setMessage(response.data.message);

    } catch (error: any) {

      setIsError(true);

      // Backend unreachable, or endpoint not available
      setMessage(
        error.response?.data?.message ||
        "Password reset isn't available right now. Please try again later or contact support."
      );

    } finally {
      setSending(false);
    }

  };

  return (
    <div className="forgot-password-overlay" onClick={onClose}>

      <div
        className="forgot-password-card"
        onClick={(e) => e.stopPropagation()}
      >

        <button className="forgot-password-close" onClick={onClose}>
          ×
        </button>

        <h2>Reset Your Password</h2>

        <p>Enter your email and we'll send you reset instructions.</p>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {message && (
          <p
            className={
              isError
                ? "forgot-password-message error"
                : "forgot-password-message success"
            }
          >
            {message}
          </p>
        )}

        <button
          className="forgot-password-submit"
          onClick={handleSubmit}
          disabled={sending}
        >
          {sending ? "Sending..." : "Send Reset Link"}
        </button>

      </div>

    </div>
  );
}

export default ForgotPasswordModal;
