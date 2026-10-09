const prisma = require("../prisma");

// =====================================================
// CREATE OR GET CONVERSATION
// POST /api/conversations
// =====================================================

exports.createOrGet = async (req, res) => {
  try {
    const buyerId = Number(req.user.id);
    const { listing_id } = req.body;

    if (!buyerId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!listing_id) {
      return res.status(400).json({
        success: false,
        message: "listing_id is required",
      });
    }

    const listing = await prisma.listings.findUnique({
      where: { id: String(listing_id) },
      select: {
        id: true,
        title: true,
        seller_id: true,
        status: true,
      },
    });

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: "Listing not found",
      });
    }

    if (Number(listing.seller_id) === buyerId) {
      return res.status(400).json({
        success: false,
        message: "You cannot chat with your own listing",
      });
    }

    let conversation = await prisma.conversations.findFirst({
      where: {
        buyer_id: buyerId,
        seller_id: Number(listing.seller_id),
        listing_id: listing.id,
      },
      include: {
        buyer: {
          select: {
            id: true,
            name: true,
            full_name: true,
            email: true,
            phone: true,
            mobile: true,
          },
        },
        seller: {
          select: {
            id: true,
            name: true,
            full_name: true,
            email: true,
            phone: true,
            mobile: true,
          },
        },
        listing: {
          select: {
            id: true,
            title: true,
            price: true,
            city: true,
            area: true,
            images: {
              orderBy: { sort_order: "asc" },
              take: 1,
            },
          },
        },
      },
    });

    if (!conversation) {
      conversation = await prisma.conversations.create({
        data: {
          buyer_id: buyerId,
          seller_id: Number(listing.seller_id),
          listing_id: listing.id,
        },
        include: {
          buyer: {
            select: {
              id: true,
              name: true,
              full_name: true,
              email: true,
              phone: true,
              mobile: true,
            },
          },
          seller: {
            select: {
              id: true,
              name: true,
              full_name: true,
              email: true,
              phone: true,
              mobile: true,
            },
          },
          listing: {
            select: {
              id: true,
              title: true,
              price: true,
              city: true,
              area: true,
              images: {
                orderBy: { sort_order: "asc" },
                take: 1,
              },
            },
          },
        },
      });
    }

    return res.status(200).json({
      success: true,
      message: "Conversation ready",
      conversation,
    });
  } catch (error) {
    console.log("=================================");
    console.log("❌ CREATE CONVERSATION ERROR");
    console.log("MESSAGE:", error?.message);
    console.log("=================================");

    return res.status(500).json({
      success: false,
      message: "Unable to create conversation",
      error: error?.message,
    });
  }
};

// =====================================================
// GET MY CONVERSATIONS
// GET /api/conversations
// =====================================================

exports.getMyConversations = async (req, res) => {
  try {
    const userId = Number(req.user.id);
    const role = String(req.user.role || "").toUpperCase();

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // ---------------------------------------------
    // FETCH CONVERSATIONS
    // ---------------------------------------------

    const conversations = await prisma.conversations.findMany({
      where: {
        OR: [{ buyer_id: userId }, { seller_id: userId }],
      },

      orderBy: {
        updated_at: "desc",
      },

      include: {
        buyer: {
          select: {
            id: true,
            name: true,
            full_name: true,
            phone: true,
            mobile: true,
          },
        },

        seller: {
          select: {
            id: true,
            name: true,
            full_name: true,
            phone: true,
            mobile: true,
          },
        },

        listing: {
          select: {
            id: true,
            title: true,
            price: true,
            city: true,
            area: true,

            images: {
              orderBy: { sort_order: "asc" },
              take: 1,
            },
          },
        },

        messages: {
          orderBy: { created_at: "desc" },
          take: 1,

          select: {
            id: true,
            message: true,
            sender_id: true,
            is_read: true,
            created_at: true,
          },
        },
      },
    });

    // ---------------------------------------------
    // ENRICH EACH CONVERSATION
    // 1. unread_count (per conversation)
    // 2. other_user (buyer or seller)
    // 3. other_party (name string)
    // ---------------------------------------------

    const enriched = await Promise.all(
      conversations.map(async (c) => {
        // Unread count: messages NOT sent by me + is_read = false
        const unread_count = await prisma.messages.count({
          where: {
            conversation_id: c.id,
            sender_id: { not: userId },
            is_read: false,
          },
        });

        // Determine other party
        const isSellerSide = Number(c.seller_id) === userId;
        const other_user = isSellerSide ? c.buyer : c.seller;

        const other_party =
          other_user?.name ||
          other_user?.full_name ||
          (isSellerSide ? "Buyer" : "Seller");

        return {
          id: c.id,
          buyer_id: c.buyer_id,
          seller_id: c.seller_id,
          listing_id: c.listing_id,
          created_at: c.created_at,
          updated_at: c.updated_at,

          buyer: c.buyer,
          seller: c.seller,
          listing: c.listing,

          // Latest message (already ordered desc + take 1)
          latest_message: c.messages?.[0] || null,

          // Extra for frontend
          other_user,
          other_party,
          unread_count,
        };
      })
    );

    // ---------------------------------------------
    // TOTAL UNREAD (badge-ku direct use)
    // ---------------------------------------------

    const total_unread = enriched.reduce(
      (sum, c) => sum + (c.unread_count || 0),
      0
    );

    return res.json({
      success: true,
      count: enriched.length,
      total_unread,
      conversations: enriched,
    });
  } catch (error) {
    console.log("=================================");
    console.log("❌ GET CONVERSATIONS ERROR");
    console.log("MESSAGE:", error?.message);
    console.log("=================================");

    return res.status(500).json({
      success: false,
      message: "Unable to fetch conversations",
      error: error?.message,
    });
  }
};
// =====================================================
// MARK CONVERSATION AS READ
// PATCH /api/conversations/:id/read
// =====================================================

exports.markAsRead = async (req, res) => {
  try {
    const userId = Number(req.user.id);
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Conversation ID is required",
      });
    }

    // ---------------------------------------------
    // Verify user is part of conversation
    // ---------------------------------------------

    const conversation = await prisma.conversations.findUnique({
      where: { id },
      select: {
        id: true,
        buyer_id: true,
        seller_id: true,
      },
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    const isParticipant =
      Number(conversation.buyer_id) === userId ||
      Number(conversation.seller_id) === userId;

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: "You are not part of this conversation",
      });
    }

    // ---------------------------------------------
    // Mark all OTHER user's messages as read
    // (My own messages venaam)
    // ---------------------------------------------

    const result = await prisma.messages.updateMany({
      where: {
        conversation_id: id,
        sender_id: { not: userId },
        is_read: false,
      },
      data: {
        is_read: true,
      },
    });

    console.log("=================================");
    console.log("✅ MARK AS READ");
    console.log("Conversation:", id);
    console.log("User:", userId);
    console.log("Updated:", result.count);
    console.log("=================================");

    return res.json({
      success: true,
      message: "Messages marked as read",
      updated: result.count,
    });
  } catch (error) {
    console.log("=================================");
    console.log("❌ MARK AS READ ERROR");
    console.log("MESSAGE:", error?.message);
    console.log("=================================");

    return res.status(500).json({
      success: false,
      message: "Unable to mark as read",
      error: error?.message,
    });
  }
};