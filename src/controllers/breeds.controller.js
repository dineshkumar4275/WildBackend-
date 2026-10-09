const prisma = require("../prisma");

// =====================================================
// GET BREEDS BY CATEGORY
// GET /api/breeds?categoryId=XXXX
// =====================================================

exports.getByCategory = async (req, res) => {
  try {
    const { categoryId } = req.query;

    if (!categoryId) {
      return res.status(400).json({
        success: false,
        error: "categoryId is required",
      });
    }

    const category =
      await prisma.animal_categories.findUnique({
        where: {
          id: categoryId,
        },
      });

    if (!category || !category.is_active) {
      return res.status(404).json({
        success: false,
        error: "Invalid animal category",
      });
    }

    const breeds =
      await prisma.animal_breeds.findMany({
        where: {
          category_id: categoryId,
          is_active: true,
        },

        orderBy: {
          name: "asc",
        },

        select: {
          id: true,
          name: true,
          slug: true,
        },
      });

    return res.json({
      success: true,
      category: {
        id: category.id,
        name: category.name,
      },
      count: breeds.length,
      breeds,
    });
  } catch (error) {
    console.error(
      "[GET BREEDS ERROR]",
      error
    );

    return res.status(500).json({
      success: false,
      error: "Failed to fetch breeds",
      details: error.message,
    });
  }
};