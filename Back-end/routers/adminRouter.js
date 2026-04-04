import express from "express";
import { verifyAccessToken, requireRole } from "../middleware/auth.js";
import {
  createMenuItem, updateMenuItem, deleteMenuItem, toggleAvailability,
  getAdminAnalytics, getAdminUsers, updateUserRole,
} from "../controllers/adminController.js";

const adminRouter = express.Router();

// All admin routes require auth + admin role
adminRouter.use(verifyAccessToken, requireRole("admin"));

// Analytics
adminRouter.get("/analytics", getAdminAnalytics);

// Users
adminRouter.get("/users", getAdminUsers);
adminRouter.patch("/users/:id/role", updateUserRole);

// Menu CRUD
adminRouter.post("/menu", createMenuItem);
adminRouter.put("/menu/:id", updateMenuItem);
adminRouter.delete("/menu/:id", deleteMenuItem);
adminRouter.patch("/menu/:id/toggle", toggleAvailability);

export default adminRouter;
