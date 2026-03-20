import { body, validationResult } from "express-validator";

/**
 * Middleware to handle validation results from express-validator
 */
export const validateResult = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: "Validation Failed",
      details: errors.array().map((err) => ({
        path: err.path,
        message: err.msg,
      })),
    });
  }
  next();
};

/**
 * Auth Validation Schemas
 */
export const signupValidation = [
  body("uname")
    .trim()
    .notEmpty().withMessage("Full Name is required")
    .isLength({ min: 7 }).withMessage("Name must contain at least 7 characters")
    .isLength({ max: 50 }).withMessage("Name is too long"),
  body("uemail")
    .trim()
    .notEmpty().withMessage("Email Address is required")
    .isEmail().withMessage("Invalid email format")
    .normalizeEmail(),
  body("upassword")
    .notEmpty().withMessage("Password is required")
    .isLength({ min: 8 }).withMessage("Password must contain at least 8 characters")
    .matches(/[A-Z]/).withMessage("Password must contain at least one uppercase letter")
    .matches(/[a-z]/).withMessage("Password must contain at least one lowercase letter")
    .matches(/[0-9]/).withMessage("Password must contain at least one number"),
  validateResult
];

export const loginValidation = [
  body("uemail")
    .trim()
    .notEmpty().withMessage("Email Address is required")
    .isEmail().withMessage("Invalid email format")
    .normalizeEmail(),
  body("upassword")
    .notEmpty().withMessage("Password is required"),
  validateResult
];

/**
 * Product Validation Schemas
 */
export const productValidation = [
  body("title").trim().notEmpty().withMessage("Title is required"),
  body("price").isFloat({ gt: 0 }).withMessage("Price must be a positive number"),
  body("img").trim().notEmpty().withMessage("Image URL is required").isURL().withMessage("Invalid image URL"),
  body("category").optional().trim(),
  body("decrp").optional().trim(),
  validateResult
];

/**
 * Order Validation Schemas
 */
export const orderValidation = [
  body("items")
    .isArray({ min: 1 }).withMessage("Order must have at least one item")
    .notEmpty().withMessage("Items are required"),
  body("items.*.productId").trim().notEmpty().withMessage("Product ID is required"),
  body("items.*.quantity").isInt({ gt: 0 }).withMessage("Quantity must be a positive integer"),
  body("totalAmount").isFloat({ gt: 0 }).withMessage("Total amount must be positive"),
  body("status").optional().isIn(["pending", "processing", "shipped", "delivered", "cancelled"]),
  validateResult
];

/**
 * OTP Validation Schemas
 */
export const otpSendValidation = [
  body("channel").isIn(["sms", "whatsapp", "email"]).withMessage("Invalid channel"),
  body("contact").trim().notEmpty().withMessage("Contact is required"),
  validateResult
];

export const otpVerifyValidation = [
  body("contact").trim().notEmpty().withMessage("Contact is required"),
  body("code").trim().isLength({ min: 6, max: 6 }).withMessage("OTP must be 6 digits"),
  validateResult
];
