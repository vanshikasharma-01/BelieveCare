// One-time bootstrap script to create the very first Owner account.
//
// Public /api/auth/signup always forces role "Customer" (this is a
// deliberate security fix — otherwise anyone could sign up as
// "Owner" and get full admin access). That means there needs to be
// one legitimate, out-of-band way to create the first Owner. Run
// this script once when setting up the app, then use the Owner
// account to log in and create any further Owner/IT Staff accounts
// via POST /api/auth/staff.
//
// Usage:
//   node seed/createOwner.js "Owner Name" owner@example.com "StrongPassword123!" "9999999999"
//
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/user");

async function main() {
  const [, , name, email, password, phone] = process.argv;

  if (!name || !email || !password) {
    console.error(
      'Usage: node seed/createOwner.js "Full Name" email@example.com "Password123!" [phone]'
    );
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);

  const existing = await User.findOne({ email });
  if (existing) {
    console.error(`A user with email ${email} already exists (role: ${existing.role}).`);
    await mongoose.disconnect();
    process.exit(1);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    phone,
    role: "Owner",
  });

  console.log(`Owner account created: ${user.email} (id: ${user._id})`);
  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
