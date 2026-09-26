// const prisma = require('../prisma');
// const { generateOtp, verifyOtp } = require('../utils/otp');
// const { signToken } = require('../utils/jwt');
// const { sendOtpEmail } = require('../utils/email');

// // POST /api/auth/send-otp  { email, name? }
// exports.sendOtp = async (req, res) => {
//   const { email, name } = req.body;
//   if (!email || !email.includes('@')) {
//     return res.status(400).json({ error: 'Valid email required' });
//   }

//   const otp = generateOtp(email.toLowerCase().trim());

//   try {
//     await sendOtpEmail(email.toLowerCase().trim(), otp, name);
//     res.json({ success: true, message: `OTP sent to ${email}` });
//   } catch (e) {
//     console.error('Send OTP error:', e);
//     res.status(500).json({ error: 'Failed to send email. Check EMAIL_USER / EMAIL_PASS.' });
//   }
// };

// // POST /api/auth/verify-otp  { email, otp, name?, role? }
// exports.verifyOtp = async (req, res) => {
//   const { email, otp, name, role } = req.body;
//   if (!email || !otp) {
//     return res.status(400).json({ error: 'Email and OTP required' });
//   }

//   const cleanEmail = email.toLowerCase().trim();

//   if (!verifyOtp(cleanEmail, otp)) {
//     return res.status(400).json({ error: 'Invalid or expired OTP' });
//   }

//   let user = await prisma.user.findUnique({ where: { email: cleanEmail } });
//   if (!user) {
//     user = await prisma.user.create({
//       data: {
//         email: cleanEmail,
//         phone: null, // email-based signup
//         name: name || cleanEmail.split('@')[0],
//         role: role === 'SELLER' ? 'SELLER' : 'BUYER',
//       },
//     });
//   }

//   const token = signToken(user.id);
//   res.json({
//     token,
//     user: {
//       id: user.id,
//       email: user.email,
//       phone: user.phone,
//       name: user.name,
//       role: user.role,
//       walletBalance: user.walletBalance,
//     },
//   });
// };

// // GET /api/auth/me
// exports.me = async (req, res) => {
//   res.json({
//     user: {
//       id: req.user.id,
//       email: req.user.email,
//       phone: req.user.phone,
//       name: req.user.name,
//       role: req.user.role,
//       walletBalance: req.user.walletBalance,
//     },
//   });
// };
const prisma = require('../prisma');
const { generateOtp, verifyOtp } = require('../utils/otp');
const { signToken } = require('../utils/jwt');
const { sendOtpEmail } = require('../utils/email');

// POST /api/auth/send-otp
exports.sendOtp = async (req, res) => {
  const { email, name } = req.body;
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Valid email required' });
  }

  const cleanEmail = email.toLowerCase().trim();
  const otp = generateOtp(cleanEmail);

  // ⭐ Respond immediately with the OTP for dev testing
  // (like your e-commerce app's testOTP)
  res.json({
    success: true,
    message: `OTP sent to ${cleanEmail}`,
    testOTP: process.env.NODE_ENV === 'development' ? otp : undefined,
  });

  // Send email in background — doesn't block the response
  sendOtpEmail(cleanEmail, otp, name).catch((e) => {
    console.error('📧 Email error:', e.message);
  });
};

// POST /api/auth/verify-otp
exports.verifyOtp = async (req, res) => {
  const { email, otp, name, role } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ error: 'Email and OTP required' });
  }

  const cleanEmail = email.toLowerCase().trim();

  if (!verifyOtp(cleanEmail, otp)) {
    return res.status(400).json({ error: 'Invalid or expired OTP' });
  }

  let user = await prisma.user.findUnique({ where: { email: cleanEmail } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: cleanEmail,
        phone: null,
        name: name || cleanEmail.split('@')[0],
        role: role === 'SELLER' ? 'SELLER' : 'BUYER',
      },
    });
  }

  const token = signToken(user.id);
  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      phone: user.phone,
      name: user.name,
      role: user.role,
      walletBalance: user.walletBalance,
    },
  });
};

// GET /api/auth/me
exports.me = async (req, res) => {
  res.json({
    user: {
      id: req.user.id,
      email: req.user.email,
      phone: req.user.phone,
      name: req.user.name,
      role: req.user.role,
      walletBalance: req.user.walletBalance,
    },
  });
};