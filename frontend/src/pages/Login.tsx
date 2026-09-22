import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";

import { loginUser } from "../api/authApi";
import { useToast } from "../context/ToastContext";

import background from "../assets/images/pharmacy-bg.jpg";
import logo from "../assets/images/logo.png";
import "../styles/login.css";

function Login() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  // Prefill remembered email on load
  useEffect(() => {
    const rememberedEmail = localStorage.getItem("rememberedEmail");

    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  const finishLogin = (data: any) => {
    sessionStorage.setItem("token", data.token);

    if (data.user) {
      sessionStorage.setItem("user", JSON.stringify(data.user));
      sessionStorage.setItem("userId", data.user._id);
    }

    if (rememberMe) {
      localStorage.setItem("rememberedEmail", email);
    } else {
      localStorage.removeItem("rememberedEmail");
    }

    if (data.user.role === "Customer") {
      navigate("/home");
    } else if (data.user.role === "Owner") {
      navigate("/owner-dashboard");
    } else if (data.user.role === "IT Staff") {
      navigate("/owner-dashboard");
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      showToast("Please enter email and password.", "error");
      return;
    }

    try {
      setLoading(true);

      const response = await loginUser({ email, password });

      showToast("Login Successful!", "success");

      finishLogin(response.data);

    } catch (error: any) {
      showToast(error.response?.data?.message || "Login Failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="login-page"
      style={{
        backgroundImage: `url(${background})`,
      }}
    >
      {/* Skip — lets a visitor browse as a guest without logging in.
          They'll still be asked to log in the moment they try to add
          something to the Cart or Wishlist. */}
      <span
        className="skip-login-link"
        onClick={() => navigate("/home")}
      >
        Skip for now →
      </span>

      {/* Top portion — same treatment as the Signup page: logo + tagline
          sitting directly on the background, no banner/header bar */}
      <Link to="/home" className="login-logo">
        <img src={logo} alt="Believecare" />
        <span>Believecare</span>
      </Link>

      <p className="login-tagline">We Believe In Care</p>

      {/* Login Card */}
      <div className="login-card">
        <h1>Welcome Back</h1>

        <p>Sign in to continue to Believecare</p>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <div className="password-input-wrapper">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <span
            className="password-toggle-icon"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>

        <div className="login-options">
          <label className="remember-me-label">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <span>Remember Me</span>
          </label>
        </div>

        <button
          className="login-btn"
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="create-account">
          Don't have an account?{" "}
          <Link to="/signup" className="auth-link">Create Account</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
