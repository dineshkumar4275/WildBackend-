const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),

  secure:
    String(process.env.SMTP_SECURE).toLowerCase() === "true",

  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },

  connectionTimeout: 15000,
  greetingTimeout: 15000,
  socketTimeout: 15000,
});

// =====================================================
// VERIFY SMTP CONNECTION
// =====================================================

async function verifyEmailConnection() {
  try {
    if (!process.env.SMTP_USER) {
      console.error("❌ SMTP_USER is not configured");
      return false;
    }

    if (!process.env.SMTP_PASS) {
      console.error("❌ SMTP_PASS is not configured");
      return false;
    }

    await transporter.verify();

    console.log("✅ SMTP connection successful");

    return true;
  } catch (error) {
    console.error("❌ SMTP connection failed:", error.message);

    return false;
  }
}

// =====================================================
// SEND OTP EMAIL
// =====================================================

async function sendOTPEmail(
  email,
  otp,
  name = "User"
) {
  if (!process.env.SMTP_USER) {
    throw new Error("SMTP_USER is not configured");
  }

  if (!process.env.SMTP_PASS) {
    throw new Error("SMTP_PASS is not configured");
  }

  console.log(`📧 Sending OTP email to ${email}`);

  const mailOptions = {
    from: `"Wild App" <${process.env.SMTP_USER}>`,

    to: email,

    subject: "Your Wild App OTP",

    text: `
Hello ${name},

Your OTP is:

${otp}

This OTP will expire in 10 minutes.

If you did not request this OTP, please ignore this email.

Regards,
Wild App
`,

    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
</head>

<body style="font-family: Arial, sans-serif;">

  <h2>Wild App - Email Verification</h2>

  <p>Hello ${name},</p>

  <p>Your verification OTP is:</p>

  <div
    style="
      font-size: 32px;
      font-weight: bold;
      letter-spacing: 8px;
      margin: 20px 0;
    "
  >
    ${otp}
  </div>

  <p>
    This OTP will expire in
    <strong>10 minutes</strong>.
  </p>

  <p>
    If you did not request this OTP,
    please ignore this email.
  </p>

  <br />

  <p>
    Regards,<br />
    Wild App
  </p>

</body>
</html>
`,
  };

  try {
    const result = await transporter.sendMail(mailOptions);

    console.log("✅ OTP EMAIL SENT");
    console.log("Message ID:", result.messageId);

    return result;

  } catch (error) {
    console.error("❌ OTP EMAIL FAILED");
    console.error("Code:", error.code);
    console.error("Message:", error.message);

    throw error;
  }
}

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  verifyEmailConnection,
  sendOTPEmail,
};