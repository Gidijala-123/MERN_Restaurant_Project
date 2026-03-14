import * as yup from "yup";

// --- Auth Schemas ---
export const signupSchema = yup.object().shape({
  uname: yup.string()
    .min(7, "Name must contain at least 7 characters")
    .max(50, "Name is too long")
    .required("Full Name is required"),
  uemail: yup.string()
    .email("Invalid email format")
    .required("Email Address is required"),
  upassword: yup.string()
    .min(8, "Password must contain at least 8 characters")
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
    .matches(/[a-z]/, "Password must contain at least one lowercase letter")
    .matches(/[0-9]/, "Password must contain at least one number")
    .required("Password is required"),
});

export const loginSchema = yup.object().shape({
  uemail: yup.string()
    .email("Invalid email format")
    .required("Email Address is required"),
  upassword: yup.string()
    .min(1, "Password is required")
    .required("Password is required"),
});

// --- Product Schemas ---
export const productSchema = yup.object().shape({
  title: yup.string().required("Title is required"),
  price: yup.number().positive("Price must be positive").required("Price is required"),
  decrp: yup.string().optional(),
  img: yup.string().url("Invalid image URL").required("Image URL is required"),
  category: yup.string().optional(),
});

// --- Order Schemas ---
export const orderSchema = yup.object().shape({
  userId: yup.string().required("User ID is required"),
  items: yup.array().of(yup.object().shape({
    productId: yup.string().required(),
    quantity: yup.number().integer().positive().required(),
  })).min(1, "Order must have at least one item").required(),
  totalAmount: yup.number().positive().required(),
  status: yup.string().oneOf(["pending", "processing", "shipped", "delivered", "cancelled"]).default("pending"),
});
