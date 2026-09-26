const Razorpay = require('razorpay');
const crypto = require('crypto');
const prisma = require('../prisma');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const UNLOCK_PRICE = parseInt(process.env.UNLOCK_PRICE_PAISE || '2000');

exports.createOrder = async (req, res) => {
  const { listingId } = req.body;
  if (!listingId) return res.status(400).json({ error: 'listingId required' });

  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing) return res.status(404).json({ error: 'Listing not found' });

  const existing = await prisma.unlock.findUnique({
    where: { buyerId_listingId: { buyerId: req.user.id, listingId } },
  });
  if (existing) return res.json({ alreadyUnlocked: true });

  const order = await razorpay.orders.create({
    amount: UNLOCK_PRICE,
    currency: 'INR',
    receipt: `unlock_${Date.now()}`,
    notes: { listingId, buyerId: req.user.id },
  });

  await prisma.payment.create({
    data: {
      buyerId: req.user.id,
      listingId,
      amountPaise: UNLOCK_PRICE,
      razorpayOrderId: order.id,
      status: 'created',
    },
  });

  res.json({
    orderId: order.id,
    amount: UNLOCK_PRICE,
    currency: 'INR',
    keyId: process.env.RAZORPAY_KEY_ID,
  });
};

exports.verify = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  const body = razorpay_order_id + '|' + razorpay_payment_id;
  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');

  if (expected !== razorpay_signature) {
    await prisma.payment.updateMany({
      where: { razorpayOrderId: razorpay_order_id },
      data: { status: 'failed' },
    });
    return res.status(400).json({ error: 'Invalid signature' });
  }

  const payment = await prisma.payment.update({
    where: { razorpayOrderId: razorpay_order_id },
    data: {
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      status: 'paid',
    },
  });

  await prisma.unlock.upsert({
    where: {
      buyerId_listingId: {
        buyerId: payment.buyerId,
        listingId: payment.listingId,
      },
    },
    update: {},
    create: {
      buyerId: payment.buyerId,
      listingId: payment.listingId,
      paymentId: payment.id,
    },
  });

  const listing = await prisma.listing.findUnique({
    where: { id: payment.listingId },
    include: { seller: true },
  });

  res.json({
    success: true,
    sellerPhone: listing.seller.phone,
    sellerName: listing.seller.name,
  });
};

exports.myUnlocks = async (req, res) => {
  const unlocks = await prisma.unlock.findMany({
    where: { buyerId: req.user.id },
    include: {
      listing: {
        include: { seller: { select: { name: true, phone: true } } },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ unlocks });
};