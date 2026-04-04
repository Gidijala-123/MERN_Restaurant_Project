import express from "express";
import { verifyAccessToken, requireRole } from "../middleware/auth.js";
import {
  createMenuItem, updateMenuItem, deleteMenuItem, toggleAvailability,
  getAdminAnalytics, getAdminUsers, updateUserRole,
  getAllOrders, updateOrderStatus,
  getSubscribers, deleteSubscriber,
  getActivityLog,
} from "../controllers/adminController.js";

const adminRouter = express.Router();
adminRouter.use(verifyAccessToken, requireRole("admin"));

// Analytics
adminRouter.get("/analytics", getAdminAnalytics);

// Orders
adminRouter.get("/orders", getAllOrders);
adminRouter.patch("/orders/:id/status", updateOrderStatus);

// Users
adminRouter.get("/users", getAdminUsers);
adminRouter.patch("/users/:id/role", updateUserRole);

// Menu CRUD
adminRouter.post("/menu", createMenuItem);
adminRouter.put("/menu/:id", updateMenuItem);
adminRouter.delete("/menu/:id", deleteMenuItem);
adminRouter.patch("/menu/:id/toggle", toggleAvailability);

// Subscribers
adminRouter.get("/subscribers", getSubscribers);
adminRouter.delete("/subscribers/:id", deleteSubscriber);

// Activity log
adminRouter.get("/activity", getActivityLog);

export default adminRouter;
