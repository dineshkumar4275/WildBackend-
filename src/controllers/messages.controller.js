
const prisma = require("../prisma");

// =====================================================
// CHECK CONVERSATION ACCESS
// =====================================================

const getConversationForUser = async (
  conversationId,
  userId
) => {
  return prisma.conversations.findFirst({
    where: {
      id: String(conversationId),

      OR: [
        {
          buyer_id: Number(userId),
        },
        {
          seller_id: Number(userId),
        },
      ],
    },
  });
};

// =====================================================
// GET MESSAGES
// GET /api/messages/:conversationId
// =====================================================

exports.getMessages = async (req, res) => {
  try {
    const userId = Number(req.user.id);
    const conversationId = String(
      req.params.conversationId || ""
    );

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!conversationId) {
      return res.status(400).json({
        success: false,
        message: "Conversation ID is required",
      });
    }

    const conversation =
      await getConversationForUser(
        conversationId,
        userId
      );

    if (!conversation) {
      return res.status(403).json({
        success: false,
        message: "You are not part of this conversation",
      });
    }

    const messages =
      await prisma.messages.findMany({
        where: {
          conversation_id: conversationId,
        },

        orderBy: {
          created_at: "asc",
        },

        include: {
          sender: {
            select: {
              id: true,
              name: true,
              full_name: true,
            },
          },
        },
      });

    // ---------------------------------------------
    // Mark messages from other user as read
    // ---------------------------------------------

    await prisma.messages.updateMany({
      where: {
        conversation_id: conversationId,
        sender_id: {
          not: userId,
        },
        is_read: false,
      },

      data: {
        is_read: true,
      },
    });

    return res.json({
      success: true,
      count: messages.length,
      messages,
    });
  } catch (error) {
    console.log("=================================");
    console.log("❌ GET MESSAGES ERROR");
    console.log("MESSAGE:", error?.message);
    console.log("=================================");

    return res.status(500).json({
      success: false,
      message: "Unable to fetch messages",
      error: error?.message,
    });
  }
};

// =====================================================
// SEND MESSAGE
// POST /api/messages/:conversationId
// =====================================================

exports.sendMessage = async (req, res) => {
  try {
    const userId = Number(req.user.id);
    const conversationId = req.params.conversationId || req.body.conversation_id;
    const messageText = String(req.body.message || "").trim();

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!conversationId) {
      return res.status(400).json({
        success: false,
        message: "Conversation ID required",
      });
    }

    if (!messageText) {
      return res.status(400).json({
        success: false,
        message: "Message required",
      });
    }

    // ---------------------------------------------
    // Verify user is part of conversation
    // ---------------------------------------------

    const conv = await prisma.conversations.findUnique({
      where: { id: conversationId },
      select: { buyer_id: true, seller_id: true },
    });

    if (!conv) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    const isParticipant =
      Number(conv.buyer_id) === userId ||
      Number(conv.seller_id) === userId;

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: "Not part of this conversation",
      });
    }

    // ---------------------------------------------
    // ✅ Create message with is_read: true
    // (Sender already "read" their own message)
    // ---------------------------------------------

    const newMessage = await prisma.messages.create({
      data: {
        conversation_id: conversationId,
        sender_id: userId,
        message: messageText,
        is_read: true,     // ✅ IDHU
      },
    });

    // Update conversation updated_at
    await prisma.conversations.update({
      where: { id: conversationId },
      data: { updated_at: new Date() },
    });

    console.log("✅ MESSAGE SENT:", newMessage.id, "is_read: true");

    return res.status(201).json({
      success: true,
      message: "Message sent",
      data: newMessage,
    });
  } catch (error) {
    console.log("❌ SEND MESSAGE ERROR:", error?.message);

    return res.status(500).json({
      success: false,
      message: "Unable to send message",
      error: error?.message,
    });
  }
};
