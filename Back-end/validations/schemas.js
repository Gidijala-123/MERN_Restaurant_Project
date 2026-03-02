import { z } from "zod";

// --- Auth Schemas ---
export const signupSchema = z.object({
  uname: z.string()
    .min(7, "Name must contain at least 7 characters")
    .max(50, "Name is too long"),
  uemail: z.string()
    .email("Invalid email format"),
  upassword: z.string()
    .min(8, "Password must contain at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

export const loginSchema = z.object({
  uemail: z.string()
    .email("Invalid email format"),
  upassword: z.string()
    .min(1, "Password is required"),
});

// --- Product Schemas ---
export const productSchema = z.object({
  title: z.string().min(1, "Title is required"),
  price: z.number().positive("Price must be positive"),
  decrp: z.string().optional(),
  img: z.string().url("Invalid image URL"),
  category: z.string().optional(),
});

// --- Order Schemas ---
export const orderSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().int().positive(),
  })).min(1, "Order must have at least one item"),
  totalAmount: z.number().positive(),
  status: z.enum(["pending", "processing", "shipped", "delivered", "cancelled"]).default("pending"),
});
