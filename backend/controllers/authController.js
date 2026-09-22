const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { OAuth2Client } = require("google-auth-library");
const { sendEmail } = require("../utils/sendEmail");

const googleClient = process.env.GOOGLE_CLIENT_ID
  ? new OAuth2Client(process.env.GOOGLE_CLIENT_ID)
  : null;

// Signup
const signup = async (req, res) => {
  try {

    const { name, email, password, phone } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Full Name is required",
      });
    }

    if (name.trim().length > 40) {
      return res.status(400).json({
        success: false,
        message: "Full Name cannot be more than 40 characters",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // SECURITY: role is intentionally NOT taken from req.body. Public
    // signup can only ever create a "Customer" account — otherwise
    // anyone could self-assign the "Owner" or "IT Staff" role and gain
    // full admin access. Owner/IT Staff accounts must be created via a
    // separate authenticated, Owner-only endpoint (see createStaffUser).
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      role: "Customer",
    });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      success: true,
      message: "Signup Successful",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};
// Login
const login = async (req, res) => {
  try {

    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid Password",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.status(200).json({
      success: true,
      message: "Login Successful",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};



// Get logged-in user's profile
const getProfile = async (req, res) => {
  try {

    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// Update logged-in user's profile
const updateProfile = async (req, res) => {
  try {

    const { name, phone } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, phone },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};


// Change logged-in user's password
const changePassword = async (req, res) => {
  try {

    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);

    await user.save();

    res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};


// Add a new saved address for the logged-in user
const addAddress = async (req, res) => {
  try {

    const { name, phone, address, city, pincode, type } = req.body;

    if (!name || !phone || !address || !city || !pincode) {
      return res.status(400).json({
        success: false,
        message: "Please fill all fields",
      });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.addresses.push({
      name,
      phone,
      address,
      city,
      pincode,
      type: type === "Office" ? "Office" : "Home",
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: "Address saved",
      addresses: user.addresses,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};


// Delete a saved address for the logged-in user
const deleteAddress = async (req, res) => {
  try {

    const { addressId } = req.params;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.addresses = user.addresses.filter(
      (addr) => addr._id.toString() !== addressId
    );

    await user.save();

    res.status(200).json({
      success: true,
      message: "Address deleted",
      addresses: user.addresses,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};


// ===============================
// FORGOT PASSWORD
// ===============================
const forgotPassword = async (req, res) => {
  try {

    const { email } = req.body;

    const user = await User.findOne({ email });

    // Always respond with the same generic message whether or not the
    // account exists — avoids leaking which emails are registered.
    const genericResponse = {
      success: true,
      message:
        "If an account exists for that email, password reset instructions have been sent.",
    };

    if (!user) {
      return res.status(200).json(genericResponse);
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour

    await user.save();

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const resetLink = `${frontendUrl}/reset-password/${resetToken}`;

    let emailConfigured = false;

    try {
      emailConfigured = await sendEmail({
        to: user.email,
        subject: "Reset your Believecare password",
        html: `
          <p>Hi ${user.name || "there"},</p>
          <p>We received a request to reset your Believecare password. Click the link below to choose a new one:</p>
          <p><a href="${resetLink}">${resetLink}</a></p>
          <p>This link will expire in 1 hour. If you didn't request this, you can safely ignore this email.</p>
        `,
        text: `Reset your Believecare password: ${resetLink} (expires in 1 hour)`,
      });
    } catch (emailError) {
      console.log("[Forgot Password] Failed to send reset email:", emailError.message);
    }

    if (!emailConfigured) {
      // No email service is configured (or sending failed) — log the
      // link here so it can still be tested/used locally.
      console.log(`[Forgot Password] Reset link for ${email}: ${resetLink}`);
      console.log(
        "[Forgot Password] Email delivery is not configured — " +
        "set EMAIL_HOST/EMAIL_USER/EMAIL_PASS in backend/.env to send this automatically."
      );
    }

    res.status(200).json({
      ...genericResponse,
      emailConfigured,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};


// ===============================
// RESET PASSWORD
// ===============================
const resetPassword = async (req, res) => {
  try {

    const { token, newPassword } = req.body;

    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Reset link is invalid or has expired.",
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Password has been reset successfully.",
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};


// ===============================
// CREATE STAFF USER (Owner only)
// Lets an existing Owner create "Owner" or "IT Staff" accounts.
// This is the ONLY legitimate way to create a non-Customer account —
// public /signup always forces role to "Customer".
// ===============================
const createStaffUser = async (req, res) => {
  try {

    const { name, email, password, phone, role } = req.body;

    if (!["Owner", "IT Staff"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "role must be 'Owner' or 'IT Staff'",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      role,
    });

    res.status(201).json({
      success: true,
      message: `${role} account created`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};


// ===============================
// GOOGLE SIGN-IN
// ===============================
const googleAuth = async (req, res) => {
  try {

    if (!googleClient) {
      return res.status(503).json({
        success: false,
        message:
          "Google Sign-In is not configured on this server. Set GOOGLE_CLIENT_ID in the backend .env to enable it.",
      });
    }

    const { credential } = req.body;

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    let user = await User.findOne({ email: payload.email });

    if (!user) {
      user = await User.create({
        name: payload.name,
        email: payload.email,
        googleId: payload.sub,
        role: "Customer",
      });
    } else if (!user.googleId) {
      user.googleId = payload.sub;
      await user.save();
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {

    console.error("Google auth error:", error);

    res.status(401).json({
      success: false,
      message: "Google Sign-In failed. Please try again.",
    });

  }
};


module.exports = {
  signup,
  login,
  getProfile,
  updateProfile,
  changePassword,
  addAddress,
  deleteAddress,
  forgotPassword,
  resetPassword,
  googleAuth,
  createStaffUser,
};