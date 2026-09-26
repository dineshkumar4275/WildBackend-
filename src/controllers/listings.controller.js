const prisma = require('../prisma');

exports.getAll = async (req, res) => {
  const { category, q, location } = req.query;

  const where = { status: 'Active' };
  if (category && category !== 'all') where.category = category;
  if (location) where.location = { contains: location, mode: 'insensitive' };
  if (q) {
    where.OR = [
      { title: { contains: q, mode: 'insensitive' } },
      { breed: { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } },
    ];
  }

  const listings = await prisma.listing.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      seller: { select: { id: true, name: true, phone: true } },
    },
  });

  res.json({ listings });
};

exports.getOne = async (req, res) => {
  const { id } = req.params;

  const listing = await prisma.listing.findUnique({
    where: { id },
    include: {
      seller: { select: { id: true, name: true, phone: true } },
    },
  });

  if (!listing) return res.status(404).json({ error: 'Listing not found' });

  let unlocked = false;
  if (req.user) {
    const unlock = await prisma.unlock.findUnique({
      where: { buyerId_listingId: { buyerId: req.user.id, listingId: id } },
    });
    unlocked = !!unlock;
  }

  res.json({
    listing: {
      ...listing,
      seller: unlocked
        ? listing.seller
        : { id: listing.seller.id, name: listing.seller.name, phone: null },
      unlocked,
    },
  });
};

exports.create = async (req, res) => {
  const { title, category, breed, price, age, description, location, images } =
    req.body;

  if (!title || !category || !breed || !price || !description || !location) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const listing = await prisma.listing.create({
    data: {
      sellerId: req.user.id,
      title,
      category,
      breed,
      price: parseInt(price),
      age: age || null,
      description,
      location,
      images: images || [],
    },
  });

  res.status(201).json({ listing });
};

exports.mine = async (req, res) => {
  const listings = await prisma.listing.findMany({
    where: { sellerId: req.user.id },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ listings });
};

exports.remove = async (req, res) => {
  const { id } = req.params;
  const listing = await prisma.listing.findUnique({ where: { id } });
  if (!listing) return res.status(404).json({ error: 'Not found' });
  if (listing.sellerId !== req.user.id) {
    return res.status(403).json({ error: 'Not your listing' });
  }
  await prisma.listing.delete({ where: { id } });
  res.json({ success: true });
};
// PATCH /api/listings/:id/approve (Admin)
exports.approve = async (req, res) => {
  const listing = await prisma.listing.update({
    where: { id: req.params.id },
    data: { status: 'ACTIVE', rejectionNote: null },
  });
  res.json({ listing });
};

// PATCH /api/listings/:id/reject (Admin)
exports.reject = async (req, res) => {
  const { note } = req.body;
  const listing = await prisma.listing.update({
    where: { id: req.params.id },
    data: { status: 'REJECTED', rejectionNote: note || 'Not compliant' },
  });
  res.json({ listing });
};