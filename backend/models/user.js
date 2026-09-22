const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      // Not required for accounts created via Google Sign-In
      required: function () {
        return !this.googleId;
      },
    },

    phone: {
      type: String,
    },

    role: {
      type: String,
      enum: ["Owner", "Customer", "IT Staff"],
      default: "Customer",
    },

    addresses: [
      {
        name: { type: String, required: true },
        phone: { type: String, required: true },
        address: { type: String, required: true },
        city: { type: String, required: true },
        pincode: { type: String, required: true },
        type: { type: String, enum: ["Home", "Office"], default: "Home" },
      },
    ],

    resetPasswordToken: {
      type: String,
    },

    resetPasswordExpires: {
      type: Date,
    },

    googleId: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);