import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";

import { resetPasswordApi } from "../api/authApi";
import { useToast } from "../context/ToastContext";

import background from "../assets/images/pharmacy-bg.jpg";
import logo from "../assets/images/logo.png";
import "../styles/login.css";

function ResetPassword() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async () => {
    if (!token) {
      showToast("This reset link is invalid.", "error");
      return;
    }

    if (!newPassword || newPassword.length < 8) {
      showToast("Password must be at least 8 characters.", "error");
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast("Passwords do not match.", "error");
      return;
    }

    try {
      setSubmitting(true);

      await resetPasswordApi(token, newPassword);

      setDone(true);
      showToast("Password has been reset successfully!", "success");
    } catch (error: any) {
      showToast(
        error.response?.data?.message ||
          "This reset link is invalid or has expired. Please request a new one.",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="login-page"
      style={{
        backgroundImage: `url(${background})`,
      }}
    >
      <Link to="/home" className="login-logo">
        <img src={logo} alt="Believecare" />
        <span>Believecare</span>
      </Link>

      <p className="login-tagline">We Believe In Care</p>

      <div className="login-card">
        <h1>Reset Your Password</h1>

        {done ? (
          <>
            <p>Your password has been changed successfully.</p>

            <button
              className="login-btn"
              onClick={() => navigate("/")}
              style={{ marginTop: 16 }}
            >
              Go to Login
            </button>
          </>
        ) : (
          <>
            <p>Enter a new password for your account.</p>

            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />

              <span
                className="password-toggle-icon"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>

            <div className="password-input-wrapper" style={{ marginTop: 12 }}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <button
              className="login-btn"
              onClick={handleSubmit}
              disabled={submitting}
              style={{ marginTop: 16 }}
            >
              {submitting ? "Resetting..." : "Reset Password"}
            </button>

            <p className="create-account">
              Remembered your password? <Link to="/">Login</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default ResetPassword;
