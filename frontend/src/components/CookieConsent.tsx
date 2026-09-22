import { useState, useEffect } from "react";
import "../styles/cookieConsent.css";

function CookieConsent() {

  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookieConsent");

    if (!consent) {
      setVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookieConsent", "accepted");
    setVisible(false);
  };

  const handleReject = () => {
    localStorage.setItem("cookieConsent", "rejected");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="cookie-consent-banner">
      <p>
        We use cookies to improve your experience on Believecare and to
        remember your preferences. You can accept or reject non-essential
        cookies.
      </p>

      <div className="cookie-consent-actions">
        <button className="cookie-reject" onClick={handleReject}>
          Reject
        </button>

        <button className="cookie-accept" onClick={handleAccept}>
          Accept
        </button>
      </div>
    </div>
  );
}

export default CookieConsent;
