import MenuItem from "../models/MenuModel.js";
import logger from "../logging/logger.js";

/**
 * Get all menu items (with optional filtering and pagination)
 */
export const getAllMenuItems = async (req, res) => {
  try {
    const { category, subCategory, page = 1, limit = 20, search } = req.query;
    const skip = (page - 1) * limit;

    let query = {};

    // Apply filters
    if (category && category !== "Hot Offers") {
      query.category = category;
    }

    if (subCategory) {
      query.subCategory = subCategory;
    }

    if (search) {
      query.$text = { $search: search };
    }

    // Get total count for pagination
    const total = await MenuItem.countDocuments(query);

    // Get items
    const items = await MenuItem.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    res.status(200).json({
      status: "success",
      data: {
        items,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit),
          limit: parseInt(limit),
        },
      },
    });
  } catch (error) {
    logger.error("Error fetching menu items", error);
    res.status(500).json({
      status: "error",
      message: "Error fetching menu items",
    });
  }
};

/**
 * Get items by category
 */
export const getItemsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    // Hot Offers returns all items marked as hot offers
    let query = {};
    if (category === "Hot Offers") {
      query.isHotOffer = true;
    } else {
      query.category = category;
    }

    const total = await MenuItem.countDocuments(query);
    const items = await MenuItem.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    if (items.length === 0) {
      return res.status(404).json({
        status: "error",
        message: `No items found in category: ${category}`,
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        category,
        items,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    logger.error("Error fetching items by category", error);
    res.status(500).json({
      status: "error",
      message: "Error fetching items by category",
    });
  }
};

/**
 * Get items by category and subcategory
 */
export const getItemsBySubCategory = async (req, res) => {
  try {
    const { category, subCategory } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const query = {
      category,
      subCategory,
    };

    const total = await MenuItem.countDocuments(query);
    const items = await MenuItem.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    if (items.length === 0) {
      return res.status(404).json({
        status: "error",
        message: `No items found in ${category} > ${subCategory}`,
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        category,
        subCategory,
        items,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    logger.error("Error fetching items by subcategory", error);
    res.status(500).json({
      status: "error",
      message: "Error fetching items by subcategory",
    });
  }
};

/**
 * Get all categories
 */
export const getCategories = async (req, res) => {
  try {
    const categories = await MenuItem.distinct("category");

    res.status(200).json({
      status: "success",
      data: {
        categories: categories.sort(),
        total: categories.length,
      },
    });
  } catch (error) {
    logger.error("Error fetching categories", error);
    res.status(500).json({
      status: "error",
      message: "Error fetching categories",
    });
  }
};

/**
 * Get subcategories for a specific category
 */
export const getSubCategories = async (req, res) => {
  try {
    const { category } = req.params;

    const subCategories = await MenuItem.distinct("subCategory", {
      category,
    });

    if (subCategories.length === 0) {
      return res.status(404).json({
        status: "error",
        message: `No subcategories found for category: ${category}`,
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        category,
        subCategories: subCategories.sort(),
        total: subCategories.length,
      },
    });
  } catch (error) {
    logger.error("Error fetching subcategories", error);
    res.status(500).json({
      status: "error",
      message: "Error fetching subcategories",
    });
  }
};

/**
 * Search menu items
 */
export const searchMenuItems = async (req, res) => {
  try {
    const { q, page = 1, limit = 20 } = req.query;

    if (!q) {
      return res.status(400).json({
        status: "error",
        message: "Search query is required",
      });
    }

    const skip = (page - 1) * limit;

    const query = {
      $text: { $search: q },
    };

    const total = await MenuItem.countDocuments(query);
    const items = await MenuItem.find(query, { score: { $meta: "textScore" } })
      .sort({ score: { $meta: "textScore" } })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    res.status(200).json({
      status: "success",
      data: {
        query: q,
        items,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    logger.error("Error searching menu items", error);
    res.status(500).json({
      status: "error",
      message: "Error searching menu items",
    });
  }
};

/**
 * Get single menu item by ID
 */
export const getMenuItemById = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await MenuItem.findById(id).lean();

    if (!item) {
      return res.status(404).json({
        status: "error",
        message: "Menu item not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: item,
    });
  } catch (error) {
    logger.error("Error fetching menu item", error);
    res.status(500).json({
      status: "error",
      message: "Error fetching menu item",
    });
  }
};

/**
 * Get hot offers
 */
export const getHotOffers = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const total = await MenuItem.countDocuments({ isHotOffer: true });
    const items = await MenuItem.find({ isHotOffer: true })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    if (items.length === 0) {
      // If no hot offers set, return all items as hot offers (default behavior)
      const allItems = await MenuItem.find({})
        .skip(skip)
        .limit(parseInt(limit))
        .lean();

      return res.status(200).json({
        status: "success",
        data: {
          category: "Hot Offers",
          items: allItems,
          pagination: {
            total: await MenuItem.countDocuments({}),
            page: parseInt(page),
            pages: Math.ceil((await MenuItem.countDocuments({})) / limit),
          },
        },
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        category: "Hot Offers",
        items,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    logger.error("Error fetching hot offers", error);
    res.status(500).json({
      status: "error",
      message: "Error fetching hot offers",
    });
  }
};

/**
 * Get category statistics
 */
export const getCategoryStats = async (req, res) => {
  try {
    const stats = await MenuItem.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          avgPrice: { $avg: "$price" },
          avgRating: { $avg: "$rating" },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    res.status(200).json({
      status: "success",
      data: {
        stats,
        total: stats.length,
      },
    });
  } catch (error) {
    logger.error("Error fetching category statistics", error);
    res.status(500).json({
      status: "error",
      message: "Error fetching category statistics",
    });
  }
};
