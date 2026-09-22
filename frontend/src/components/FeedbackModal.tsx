import { useState } from "react";
import { submitFeedback } from "../api/feedbackApi";
import "../styles/feedbackModal.css";

interface FeedbackModalProps {
  orderId: string;
  onClose: () => void;
  onSubmitted?: () => void;
}

function FeedbackModal({ orderId, onClose, onSubmitted }: FeedbackModalProps) {

  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      setError("Please select a star rating.");
      return;
    }

    if (!sessionStorage.getItem("userId")) {
      setError("Please log in again to send feedback.");
      return;
    }

    try {
      setSending(true);
      setError("");

      await submitFeedback({
        order: orderId,
        rating,
        message,
      });

      setSubmitted(true);
      onSubmitted?.();

      setTimeout(() => {
        onClose();
      }, 1400);

    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        "Could not send feedback right now. Please try again."
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="feedback-overlay" onClick={onClose}>
      <div className="feedback-card" onClick={(e) => e.stopPropagation()}>

        <button className="feedback-close" onClick={onClose}>
          ×
        </button>

        {submitted ? (
          <div className="feedback-success">
            <span className="feedback-success-icon">✓</span>
            <h2>Thank you!</h2>
            <p>Your feedback has been sent.</p>
          </div>
        ) : (
          <>
            <h2>Send Feedback</h2>
            <p>How was your order?</p>

            <div className="feedback-stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={
                    star <= (hoverRating || rating)
                      ? "feedback-star filled"
                      : "feedback-star"
                  }
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                >
                  ★
                </span>
              ))}
            </div>

            <textarea
              placeholder="Tell us more (optional)..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
            />

            {error && <p className="feedback-error">{error}</p>}

            <button
              className="feedback-submit"
              onClick={handleSubmit}
              disabled={sending}
            >
              {sending ? "Sending..." : "Submit Feedback"}
            </button>
          </>
        )}

      </div>
    </div>
  );
}

export default FeedbackModal;
