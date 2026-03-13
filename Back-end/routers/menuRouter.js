import express from "express";
import {
  getAllMenuItems,
  getItemsByCategory,
  getItemsBySubCategory,
  getCategories,
  getSubCategories,
  searchMenuItems,
  getMenuItemById,
  getHotOffers,
  getCategoryStats,
} from "../controllers/menuController.js";

const menuRouter = express.Router();

/**
 * Menu Routes
 * Base path: /api/menu
 */

// Get all categories
menuRouter.get("/categories", getCategories);

// Get category statistics
menuRouter.get("/stats", getCategoryStats);

// Get hot offers
menuRouter.get("/hot-offers", getHotOffers);

// Search menu items
menuRouter.get("/search", searchMenuItems);

// Get all menu items (with optional filters)
menuRouter.get("/", getAllMenuItems);

// Get items by category
menuRouter.get("/:category", getItemsByCategory);

// Get subcategories for a category
menuRouter.get("/:category/subcategories", getSubCategories);

// Get items by category and subcategory
menuRouter.get("/:category/:subCategory", getItemsBySubCategory);

// Get single item by ID
menuRouter.get("/item/:id", getMenuItemById);

export default menuRouter;
