const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const { authRequired } = require("../middleware/authMiddleware");

const prisma = new PrismaClient();

// =====================================================
// GET /seller/dashboard
// =====================================================

router.get("/dashboard", authRequired, async (req, res) => {
  try {
    const sellerId = Number(req.user.id);

    if (!sellerId) {
      return res.status(401).json({
        success: false,
        message: "Seller not authenticated",
      });
    }

    console.log("=================================");
    console.log("📊 SELLER DASHBOARD");
    console.log("Seller ID:", sellerId);
    console.log("=================================");

    // -----------------------------------------------
    // TRANSACTIONS
    // -----------------------------------------------

    const transactions = await prisma.transactions.findMany({
      where: {
        seller_id: sellerId,
        status: "PAID",
      },
      select: {
        id: true,
        buyer_id: true,
        total_amount: true,
        animal_price: true,
        status: true,
        created_at: true,
      },
    });

    const totalRevenue = transactions.reduce(
      (sum, t) =>
        sum + Number(t.total_amount || t.animal_price || 0),
      0
    );

    const totalOrders = transactions.length;

    const uniqueCustomers = new Set(
      transactions.map((t) => t.buyer_id)
    ).size;

    const totalSales = transactions.length;

    // -----------------------------------------------
    // LISTINGS
    // -----------------------------------------------

    const totalProducts = await prisma.listings.count({
      where: { seller_id: sellerId },
    });

    const outOfStock = await prisma.listings.count({
      where: {
        seller_id: sellerId,
        status: "SOLD",
      },
    });

    // -----------------------------------------------
    // ANALYTICS — last 7 days
    // -----------------------------------------------

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const recentTx = await prisma.transactions.findMany({
      where: {
        seller_id: sellerId,
        status: "PAID",
        created_at: { gte: sevenDaysAgo },
      },
      select: {
        total_amount: true,
        animal_price: true,
        created_at: true,
      },
    });

    const dayLabels = ["S", "M", "T", "W", "T", "F", "S"];
    const dayMap = {};

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);

      const key = d.toISOString().slice(0, 10);

      dayMap[key] = {
        date: key,
        day: dayLabels[d.getDay()],
        revenue: 0,
      };
    }

    for (const t of recentTx) {
      const key = new Date(t.created_at)
        .toISOString()
        .slice(0, 10);

      if (dayMap[key]) {
        dayMap[key].revenue += Number(
          t.total_amount || t.animal_price || 0
        );
      }
    }

    const analytics = Object.values(dayMap);

    const weekRevenue = analytics.reduce(
      (s, a) => s + a.revenue,
      0
    );

    // -----------------------------------------------
    // RESPONSE
    // -----------------------------------------------

    const responseData = {
      revenue: totalRevenue,
      sales: totalSales,
      orders: totalOrders,
      customers: uniqueCustomers,
      totalProducts,
      outOfStock,
      analytics,
      weekRevenue,
    };

    console.log("✅ Dashboard data:", responseData);
    console.log("=================================");

    res.json({
      success: true,
      data: responseData,
    });
  } catch (error) {
    console.error("❌ Dashboard error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load dashboard",
      error: error?.message,
    });
  }
});

module.exports = router;