import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

import { signupUser } from "../api/authApi";
import { useToast } from "../context/ToastContext";

import background from "../assets/images/pharmacy-bg.jpg";
import logo from "../assets/images/logo.png";
import "../styles/signup.css";

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
  terms?: string;
}

function Signup() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!name.trim()) {
      newErrors.name = "Full Name is required.";
    } else if (!/^[A-Za-z ]+$/.test(name.trim())) {
      newErrors.name = "Name can only contain letters and spaces.";
    } else if (name.trim().length > 40) {
      newErrors.name = "Full Name cannot be more than 40 characters.";
    }

    if (!email.trim()) {
      newErrors.email = "Email is required.";
    } else if (
      !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)
    ) {
      newErrors.email = "Enter a valid email address.";
    } else if ((email.match(/\./g) || []).length > 1) {
      newErrors.email = "Please enter a valid email.";
    }

    if (!phone.trim()) {
      newErrors.phone = "Phone Number is required.";
    } else if (!/^[0-9]{10}$/.test(phone)) {
      newErrors.phone = "Phone number must contain exactly 10 digits.";
    }

    if (!password) {
      newErrors.password = "Password is required.";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters.";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Confirm your password.";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    if (!acceptedTerms) {
      newErrors.terms = "You must accept the Terms & Conditions.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async (): Promise<void> => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      const response = await signupUser({
        name,
        email,
        phone,
        password,
      });

      const data = response.data;

      sessionStorage.setItem("token", data.token);
      sessionStorage.setItem("user", JSON.stringify(data.user));
      sessionStorage.setItem("userId", data.user._id);

      showToast("Account created successfully!", "success");

      if (data.user.role === "Owner") {
        navigate("/owner-dashboard");
      } else {
        navigate("/home");
      }

    } catch (error: any) {
      showToast(error.response?.data?.message || "Signup Failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="signup-page"
      style={{
        backgroundImage: `url(${background})`,
      }}
    >
      <div className="signup-logo">
        <img src={logo} alt="Believecare" />
        <span>Believecare</span>
      </div>

      <p className="signup-tagline">We Believe In Care</p>

      <div className="signup-card">
        <h1>Create Your Account</h1>

        <p>Join Believecare Today</p>

        <input
          type="text"
          placeholder="Full Name"
          value={name}
          maxLength={40}
          onChange={(e) =>
            setName(e.target.value.replace(/[^A-Za-z ]/g, ""))
          }
        />

        {errors.name && <p className="error">{errors.name}</p>}

        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {errors.email && <p className="error">{errors.email}</p>}

        <input
          type="tel"
          placeholder="Phone Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        {errors.phone && <p className="error">{errors.phone}</p>}

        <div className="password-box">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <span
            className="eye-icon"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>

        {errors.password && <p className="error">{errors.password}</p>}

        <div className="password-box">
          <input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <span
            className="eye-icon"
            onClick={() =>
              setShowConfirmPassword(!showConfirmPassword)
            }
          >
            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>

        {errors.confirmPassword && (
          <p className="error">{errors.confirmPassword}</p>
        )}

        <label className="terms">
          <input
            type="checkbox"
            checked={acceptedTerms}
            onChange={(e) => setAcceptedTerms(e.target.checked)}
          />
          <span>I agree to the Terms &amp; Conditions</span>
        </label>

        {errors.terms && <p className="error">{errors.terms}</p>}

        <button
          className="signup-btn"
          onClick={handleSignup}
          disabled={loading}
        >
          {loading ? "Creating Account..." : "Create Account"}
        </button>

        <p className="login-link">
          Already have an account? <Link to="/" className="auth-link">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;
