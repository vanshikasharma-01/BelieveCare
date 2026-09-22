const nodemailer = require("nodemailer");

// Lazily created — only build a transporter if SMTP is actually
// configured, so the app still runs fine in dev without any email
// service set up.
let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS } = process.env;

  if (!EMAIL_HOST || !EMAIL_USER || !EMAIL_PASS) {
    return null;
  }

  transporter = nodemailer.createTransport({
    host: EMAIL_HOST,
    port: Number(EMAIL_PORT) || 587,
    // true for port 465 (implicit TLS), false for 587/25 (STARTTLS)
    secure: Number(EMAIL_PORT) === 465,
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
  });

  return transporter;
}

/**
 * Sends an email if SMTP is configured. Returns true if an email was
 * actually sent, false if it was skipped (not configured) — callers
 * should have their own console.log fallback for the latter case so
 * nothing important is silently lost during local development.
 */
async function sendEmail({ to, subject, html, text }) {
  const t = getTransporter();

  if (!t) {
    return false;
  }

  await t.sendMail({
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to,
    subject,
    html,
    text,
  });

  return true;
}

module.exports = { sendEmail };
