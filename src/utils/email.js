const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false, // TLS (587), not SSL (465)
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.sendOtpEmail = async (to, otp, name) => {
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:24px;
                background:#f8fafc;border-radius:12px;">
      <h2 style="color:#0EA5E9;margin:0 0 8px;">🐾 PetMarket</h2>
      <p style="color:#0F172A;font-size:15px;">Hi ${name || 'there'},</p>
      <p style="color:#334155;font-size:14px;">
        Your verification code is:
      </p>
      <div style="background:#fff;border:1px solid #E2E8F0;border-radius:8px;
                  padding:16px;text-align:center;margin:16px 0;">
        <div style="font-size:32px;font-weight:800;letter-spacing:8px;color:#0F172A;">
          ${otp}
        </div>
      </div>
      <p style="color:#64748B;font-size:12px;">
        This code expires in 10 minutes. Don't share it with anyone.
      </p>
      <p style="color:#94A3B8;font-size:11px;margin-top:24px;">
        If you didn't request this, ignore this email.
      </p>
    </div>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to,
    subject: `Your PetMarket verification code: ${otp}`,
    html,
  });
};

exports.verifyEmailConnection = async () => {
  try {
    await transporter.verify();
    console.log('📧 Email service ready');
    return true;
  } catch (e) {
    console.error('📧 Email error:', e.message);
    return false;
  }
};