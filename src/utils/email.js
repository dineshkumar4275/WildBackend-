const nodemailer = require("nodemailer");

// ============================================
// SMTP CONFIGURATION
// ============================================

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT || 587),
  secure: false,

  // Force IPv4
  family: 4,

  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },

  connectionTimeout: 15000,
  greetingTimeout: 15000,
  socketTimeout: 15000,
});

// ============================================
// VERIFY EMAIL CONNECTION
// ============================================

async function verifyEmailConnection() {
  try {
    console.log("");
    console.log("=================================");
    console.log("📧 SMTP CONFIGURATION");
    console.log("=================================");

    if (!process.env.SMTP_USER) {
      console.error("❌ SMTP_USER is not configured");
      return false;
    }

    if (!process.env.SMTP_PASS) {
      console.error("❌ SMTP_PASS is not configured");
      return false;
    }

    console.log("Host:", process.env.SMTP_HOST || "smtp.gmail.com");
    console.log("Port:", process.env.SMTP_PORT || 587);
    console.log("User:", process.env.SMTP_USER);

    console.log("📡 Checking SMTP connection...");

    await transporter.verify();

    console.log("✅ SMTP connection successful");
    console.log("=================================");

    return true;
  } catch (error) {
    console.error("");
    console.error("=================================");
    console.error("❌ SMTP CONNECTION FAILED");
    console.error("=================================");
    console.error("Code:", error.code || "N/A");
    console.error("Command:", error.command || "N/A");
    console.error("Message:", error.message);
    console.error("=================================");

    return false;
  }
}

// ============================================
// SEND OTP EMAIL
// ============================================

async function sendOTPEmail(email, otp, name = "User") {
  try {
    // ----------------------------------------
    // Check SMTP credentials
    // ----------------------------------------

    if (!process.env.SMTP_USER) {
      throw new Error("SMTP_USER is not configured");
    }

    if (!process.env.SMTP_PASS) {
      throw new Error("SMTP_PASS is not configured");
    }

    // ----------------------------------------
    // Clean email
    // ----------------------------------------

    const cleanEmail = String(email).trim().toLowerCase();

    console.log("");
    console.log("=================================");
    console.log("📧 STARTING OTP EMAIL");
    console.log("=================================");
    console.log("📧 From:", process.env.SMTP_USER);
    console.log("📧 To:", cleanEmail);
    console.log("👤 Name:", name);
    console.log("🔢 OTP:", otp);
    console.log("=================================");

    // ----------------------------------------
    // Mail
    // ----------------------------------------

    const mailOptions = {
      from:
        process.env.EMAIL_FROM ||
        `"PetMarket" <${process.env.SMTP_USER}>`,

      to: cleanEmail,

      subject: "Your PetMarket OTP",

      text: `
Hello ${name},

Your OTP is:

${otp}

This OTP will expire in 10 minutes.

If you did not request this OTP, please ignore this email.

Regards,
PetMarket
`,

      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>PetMarket OTP</title>
</head>

<body style="
  font-family: Arial, sans-serif;
  background: #f5f5f5;
  padding: 30px;
">

  <div style="
    max-width: 500px;
    margin: auto;
    background: white;
    padding: 30px;
    border-radius: 12px;
  ">

    <h2>PetMarket - Email Verification</h2>

    <p>Hello ${name},</p>

    <p>Your verification OTP is:</p>

    <div style="
      font-size: 32px;
      font-weight: bold;
      letter-spacing: 8px;
      margin: 20px 0;
      padding: 15px;
      background: #f3f4f6;
      text-align: center;
      border-radius: 8px;
    ">
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

    <p>
      Regards,<br>
      <strong>PetMarket</strong>
    </p>

  </div>

</body>
</html>
`,
    };

    // ----------------------------------------
    // SEND
    // ----------------------------------------

    console.log("📨 Calling transporter.sendMail()...");

    const result = await transporter.sendMail(mailOptions);

    // ----------------------------------------
    // SUCCESS
    // ----------------------------------------

    console.log("");
    console.log("=================================");
    console.log("✅ OTP EMAIL SENT SUCCESSFULLY");
    console.log("=================================");
    console.log("📧 To:", cleanEmail);
    console.log("📨 Message ID:", result.messageId);
    console.log("=================================");

    return result;

  } catch (error) {

    // ----------------------------------------
    // ERROR
    // ----------------------------------------

    console.error("");
    console.error("=================================");
    console.error("❌ OTP EMAIL FAILED");
    console.error("=================================");
    console.error("Code:", error.code || "N/A");
    console.error("Command:", error.command || "N/A");
    console.error("Response:", error.response || "N/A");
    console.error("Message:", error.message);
    console.error("=================================");

    throw error;
  }
}

// ============================================
// EXPORT
// ============================================

module.exports = {
  verifyEmailConnection,
  sendOTPEmail,
};