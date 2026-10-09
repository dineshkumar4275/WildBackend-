const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// GET /api/categories
const getCategories = async (req, res) => {
  try {
    const categories = await prisma.animal_categories.findMany({
      where: {
        is_active: true,
      },
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
        slug: true,
        is_active: true,
        breeds: {
          where: {
            is_active: true,
          },
          orderBy: {
            name: "asc",
          },
          select: {
            id: true,
            name: true,
            slug: true,
            is_active: true,
          },
        },
      },
    });

    return res.status(200).json({
      success: true,
      message: "Categories fetched successfully",
      data: categories,
    });
  } catch (error) {
    console.error("================================");
    console.error("getCategories error:", error);
    console.error("================================");

    return res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
      error: error.message,
    });
  }
};

// GET /api/categories/:categoryId/breeds
const getBreedsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const category = await prisma.animal_categories.findFirst({
      where: {
        id: categoryId,
        is_active: true,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        breeds: {
          where: {
            is_active: true,
          },
          orderBy: {
            name: "asc",
          },
          select: {
            id: true,
            name: true,
            slug: true,
            is_active: true,
          },
        },
      },
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Breeds fetched successfully",
      data: category.breeds,
    });
  } catch (error) {
    console.error("================================");
    console.error("getBreedsByCategory error:", error);
    console.error("================================");

    return res.status(500).json({
      success: false,
      message: "Failed to fetch breeds",
      error: error.message,
    });
  }
};

module.exports = {
  getCategories,
  getBreedsByCategory,
};