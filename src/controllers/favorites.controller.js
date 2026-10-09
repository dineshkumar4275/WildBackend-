const prisma = require("../prisma");

/* ==========================================
   GET ALL FAVORITES
========================================== */

exports.getAll = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
      });
    }

    const userId = Number(req.user.id);

    const favorites = await prisma.favorites.findMany({
      where: { user_id: userId },
      orderBy: { created_at: "desc" },
      include: {
        listing: {
          include: {
            category: {
              select: { id: true, name: true, slug: true },
            },
            breed: {
              select: { id: true, name: true, slug: true },
            },
            images: {
              orderBy: { sort_order: "asc" },
            },
          },
        },
      },
    });

    // Format response
    const formattedFavorites = favorites.map((fav) => {
      const listing = fav.listing || {};
      const images = listing.images || [];
      const firstImage =
        images[0]?.media_url || images[0]?.url || null;

      return {
        id: fav.id,
        listing_id: fav.listing_id,
        created_at: fav.created_at,
        listing: {
          ...listing,
          image_url: firstImage,
          price: listing.price ? Number(listing.price) : 0,
        },
      };
    });

    return res.json({
      success: true,
      count: formattedFavorites.length,
      favorites: formattedFavorites,
    });
  } catch (error) {
    console.error("[GET FAVORITES ERROR]", error);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch favorites",
    });
  }
};

/* ==========================================
   ADD FAVORITE
========================================== */

exports.add = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
      });
    }

    const userId = Number(req.user.id);
    const { listing_id } = req.body;

    if (!listing_id) {
      return res.status(400).json({
        success: false,
        error: "listing_id is required",
      });
    }

    // Check if already favorited
    const existing = await prisma.favorites.findFirst({
      where: {
        user_id: userId,
        listing_id: listing_id,
      },
    });

    if (existing) {
      return res.json({
        success: true,
        message: "Already in favorites",
        favorite: existing,
      });
    }

    const favorite = await prisma.favorites.create({
      data: {
        user_id: userId,
        listing_id: listing_id,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Added to favorites",
      favorite,
    });
  } catch (error) {
    console.error("[ADD FAVORITE ERROR]", error);
    return res.status(500).json({
      success: false,
      error: "Failed to add favorite",
    });
  }
};

/* ==========================================
   REMOVE FAVORITE
========================================== */

exports.remove = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
      });
    }

    const userId = Number(req.user.id);
    const { listingId } = req.params;

    const favorite = await prisma.favorites.findFirst({
      where: {
        user_id: userId,
        listing_id: listingId,
      },
    });

    if (!favorite) {
      return res.status(404).json({
        success: false,
        error: "Favorite not found",
      });
    }

    await prisma.favorites.delete({
      where: { id: favorite.id },
    });

    return res.json({
      success: true,
      message: "Removed from favorites",
    });
  } catch (error) {
    console.error("[REMOVE FAVORITE ERROR]", error);
    return res.status(500).json({
      success: false,
      error: "Failed to remove favorite",
    });
  }
};
/* ==========================================
   CHECK IF FAVORITED
   GET /api/favorites/check/:listingId
========================================== */

exports.check = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
      });
    }

    const userId = Number(req.user.id);
    const { listingId } = req.params;

    if (!listingId) {
      return res.status(400).json({
        success: false,
        error: "listingId is required",
      });
    }

    const existing = await prisma.favorites.findFirst({
      where: {
        user_id: userId,
        listing_id: listingId,
      },
    });

    return res.json({
      success: true,
      isFavorite: Boolean(existing),
    });
  } catch (error) {
    console.error("[CHECK FAVORITE ERROR]", error);
    return res.status(500).json({
      success: false,
      error: "Failed to check favorite",
    });
  }
};