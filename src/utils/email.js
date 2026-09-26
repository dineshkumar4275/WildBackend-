// const nodemailer = require('nodemailer');

// const transporter = nodemailer.createTransport({
//   host: process.env.EMAIL_HOST || 'smtp.gmail.com',
//   port: parseInt(process.env.EMAIL_PORT || '587'),
//   secure: false, // TLS (587), not SSL (465)
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
// });

// exports.sendOtpEmail = async (to, otp, name) => {
//   const html = `
//     <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:24px;
//                 background:#f8fafc;border-radius:12px;">
//       <h2 style="color:#0EA5E9;margin:0 0 8px;">🐾 PetMarket</h2>
//       <p style="color:#0F172A;font-size:15px;">Hi ${name || 'there'},</p>
//       <p style="color:#334155;font-size:14px;">
//         Your verification code is:
//       </p>
//       <div style="background:#fff;border:1px solid #E2E8F0;border-radius:8px;
//                   padding:16px;text-align:center;margin:16px 0;">
//         <div style="font-size:32px;font-weight:800;letter-spacing:8px;color:#0F172A;">
//           ${otp}
//         </div>
//       </div>
//       <p style="color:#64748B;font-size:12px;">
//         This code expires in 10 minutes. Don't share it with anyone.
//       </p>
//       <p style="color:#94A3B8;font-size:11px;margin-top:24px;">
//         If you didn't request this, ignore this email.
//       </p>
//     </div>
//   `;

//   await transporter.sendMail({
//     from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
//     to,
//     subject: `Your PetMarket verification code: ${otp}`,
//     html,
//   });
// };

// exports.verifyEmailConnection = async () => {
//   try {
//     await transporter.verify();
//     console.log('📧 Email service ready');
//     return true;
//   } catch (e) {
//     console.error('📧 Email error:', e.message);
//     return false;
//   }
// };
const nodemailer = require("nodemailer");

// =====================================================
// SMTP TRANSPORTER
// =====================================================

const transporter = nodemailer.createTransport({
  host:
    process.env.EMAIL_HOST ||
    "smtp.gmail.com",

  port: Number(
    process.env.EMAIL_PORT || 587
  ),

  secure:
    process.env.EMAIL_PORT === "465",

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },

  tls: {
    rejectUnauthorized: false,
  },
});

// =====================================================
// SEND OTP EMAIL
// =====================================================

exports.sendOtpEmail = async (
  to,
  otp,
  name
) => {
  console.log("==============================");
  console.log("📧 PREPARING OTP EMAIL");
  console.log("To:", to);
  console.log(
    "From:",
    process.env.EMAIL_FROM ||
      process.env.EMAIL_USER
  );
  console.log(
    "SMTP:",
    process.env.EMAIL_HOST ||
      "smtp.gmail.com"
  );
  console.log("==============================");

  const html = `
    <!DOCTYPE html>

    <html>
      <body
        style="
          margin:0;
          padding:0;
          background:#f1f5f9;
          font-family:Arial,sans-serif;
        "
      >

        <div
          style="
            max-width:480px;
            margin:40px auto;
            background:#ffffff;
            padding:30px;
            border-radius:15px;
          "
        >

          <h2
            style="
              color:#0EA5E9;
              margin-bottom:10px;
            "
          >
            🐾 PetMarket
          </h2>

          <p
            style="
              color:#0F172A;
              font-size:16px;
            "
          >
            Hi ${name || "there"},
          </p>

          <p
            style="
              color:#475569;
              font-size:14px;
            "
          >
            Your email verification OTP is:
          </p>

          <div
            style="
              background:#f8fafc;
              border:1px solid #e2e8f0;
              border-radius:10px;
              padding:20px;
              text-align:center;
              margin:20px 0;
            "
          >

            <div
              style="
                font-size:34px;
                font-weight:bold;
                letter-spacing:8px;
                color:#0F172A;
              "
            >
              ${otp}
            </div>

          </div>

          <p
            style="
              color:#64748b;
              font-size:13px;
            "
          >
            This OTP expires in 10 minutes.
          </p>

          <p
            style="
              color:#94a3b8;
              font-size:12px;
            "
          >
            If you did not request this OTP,
            you can safely ignore this email.
          </p>

        </div>

      </body>
    </html>
  `;

  const mailOptions = {
    from:
      process.env.EMAIL_FROM ||
      process.env.EMAIL_USER,

    to,

    subject:
      `Your PetMarket verification code: ${otp}`,

    html,
  };

  try {
    const info =
      await transporter.sendMail(
        mailOptions
      );

    console.log("==============================");
    console.log("✅ EMAIL SENT SUCCESSFULLY");
    console.log("Message ID:", info.messageId);
    console.log("Response:", info.response);
    console.log("==============================");

    return info;
  } catch (error) {
    console.error("==============================");
    console.error("❌ EMAIL SEND ERROR");
    console.error("Code:", error.code);
    console.error("Command:", error.command);
    console.error("Message:", error.message);
    console.error("==============================");

    throw error;
  }
};

// =====================================================
// VERIFY SMTP CONNECTION
// =====================================================

exports.verifyEmailConnection =
  async () => {
    try {
      console.log(
        "📧 Checking email SMTP connection..."
      );

      console.log(
        "SMTP HOST:",
        process.env.EMAIL_HOST ||
          "smtp.gmail.com"
      );

      console.log(
        "SMTP PORT:",
        process.env.EMAIL_PORT ||
          "587"
      );

      console.log(
        "SMTP USER:",
        process.env.EMAIL_USER
          ? "Configured"
          : "❌ NOT CONFIGURED"
      );

      console.log(
        "SMTP PASSWORD:",
        process.env.EMAIL_PASS
          ? "Configured"
          : "❌ NOT CONFIGURED"
      );

      await transporter.verify();

      console.log(
        "✅ EMAIL SERVICE READY"
      );

      return true;
    } catch (error) {
      console.error(
        "❌ EMAIL SMTP CONNECTION FAILED"
      );

      console.error(
        "Code:",
        error.code
      );

      console.error(
        "Message:",
        error.message
      );

      return false;
    }
  };