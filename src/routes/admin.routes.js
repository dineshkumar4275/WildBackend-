const router = require('express').Router();
const { authRequired } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/role');
const prisma = require('../prisma');

router.use(authRequired, requireRole('ADMIN'));

router.get('/stats', async (req, res) => {
  const [users, listings, pending, payments] = await Promise.all([
    prisma.users.count(),
    prisma.listing.count(),
    prisma.listing.count({ where: { status: 'PENDING' } }),
    prisma.payment.aggregate({ _sum: { amountPaise: true } }),
  ]);
  res.json({
    users,
    listings,
    pending,
    revenuePaise: payments._sum.amountPaise || 0,
  });
});

router.get('/listings/pending', async (req, res) => {
  const listings = await prisma.listing.findMany({
    where: { status: 'PENDING' },
    include: { seller: { select: { id: true, name: true, phone: true } } },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ listings });
});

router.get('/users', async (req, res) => {
  const users = await prisma.users.findMany({
    orderBy: { createdAt: 'desc' },
  });
  res.json({ users });
});

router.patch('/users/:id/ban', async (req, res) => {
  const { isBanned } = req.body;
  const user = await prisma.users.update({
    where: { id: req.params.id },
    data: { isBanned: !!isBanned },
  });
  res.json({ user });
});

module.exports = router;