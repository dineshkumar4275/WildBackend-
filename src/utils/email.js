const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,

  family: 4,

  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },

  connectionTimeout: 15000,
  greetingTimeout: 15000,
  socketTimeout: 15000,
});

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

async function sendOTPEmail(email, otp, name = "User") {
  if (!process.env.SMTP_USER) {
    throw new Error("SMTP_USER is not configured");
  }

  if (!process.env.SMTP_PASS) {
    throw new Error("SMTP_PASS is not configured");
  }

  console.log(`📧 Sending OTP email to ${email}`);

  const mailOptions = {
    from:
      process.env.EMAIL_FROM ||
      `"PetMarket" <${process.env.SMTP_USER}>`,

    to: email,

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
<body style="font-family: Arial, sans-serif;">
  <h2>PetMarket - Email Verification</h2>

  <p>Hello ${name},</p>

  <p>Your verification OTP is:</p>

  <div style="
    font-size: 32px;
    font-weight: bold;
    letter-spacing: 8px;
    margin: 20px 0;
  ">
    ${otp}
  </div>

  <p>
    This OTP will expire in
    <strong>10 minutes</strong>.
  </p>

  <p>
    If you did not request this OTP, please ignore this email.
  </p>

  <p>
    Regards,<br />
    PetMarket
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

module.exports = {
  verifyEmailConnection,
  sendOTPEmail,
};