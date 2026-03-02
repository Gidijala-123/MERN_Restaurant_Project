import asyncHandler from "express-async-handler";
import EmployeeModel from "../models/EmployeeModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

/**
 * @desc Register a new user
 * @route POST /api/signup
 * @access Public
 */
const registerUser = asyncHandler(async (req, res) => {
  const { uname, uemail, upassword } = req.body;
  
  // Check if user already exists in the database
  const checkForExisitingUser = await EmployeeModel.findOne({ uemail });
  if (checkForExisitingUser) {
    return res.status(403).json({ Message: "User already exists..!" });
  }

  // Hash the password before saving to database
  const hashedPassword = await bcrypt.hash(upassword, 10);
  
  // Create a new user record
  const newUser = await EmployeeModel.create({       
    uname,
    uemail,
    upassword: hashedPassword,
  });

  if (newUser) {
    return res.json({
      Message: "User created successfully..!",
      id: newUser.id,
      uemail: newUser.uemail,
    });
  } else {
    return res.status(400).json({ Error: "Invalid user data" });
  }
});

/**
 * @desc Login user and generate JWT token
 * @route POST /api/login
 * @access Public
 */
const loginUser = asyncHandler(async (req, res) => {
  const { uemail, upassword } = req.body;
  
  // Find user by email
  const validUser = await EmployeeModel.findOne({ uemail });
  
  // Verify user exists and password matches
  if (validUser && (await bcrypt.compare(upassword, validUser.upassword))) {
    // Generate JWT token containing user info
    const generateToken = jwt.sign(
      {
        tokenKey: {
          uname: validUser.uname,
          uemail: validUser.uemail,
          uid: validUser.id,
        },
      },
      process.env.ACCESS_TOKEN,
      { expiresIn: "30m" }
    );
    return res.status(200).json({ "Access Token": generateToken });
  } else {
    return res.status(401).json({ Message: "Invalid email or password" });
  }
});

/**
 * @desc Get current user info (requires authentication)
 * @route GET /api/current
 * @access Private
 */
const getCurrentUser = asyncHandler(async (req, res) => {
  // Returns user information stored in req.tokenKey by the validateToken middleware
  return res.json(req.tokenKey);
});

export { registerUser, loginUser, getCurrentUser, addBookmark, removeBookmark, getBookmarks, addCartItem, removeCartItem, getCartItems };

/**
 * @desc Add a product to user's bookmarks
 * @route POST /api/bookmark/:productId
 * @access Private
 */
const addBookmark = asyncHandler(async (req, res) => {
  const userId = req.tokenKey.uid;
  const { productId } = req.params;

  const user = await EmployeeModel.findById(userId);
  if (!user) {
    return res.status(404).json({ Message: "User not found" });
  }

  if (!user.bookmarks.includes(productId)) {
    user.bookmarks.push(productId);
    await user.save();
  }

  res.status(200).json({ Message: "Product bookmarked successfully" });
});

/**
 * @desc Remove a product from user's bookmarks
 * @route DELETE /api/bookmark/:productId
 * @access Private
 */
const removeBookmark = asyncHandler(async (req, res) => {
  const userId = req.tokenKey.uid;
  const { productId } = req.params;

  const user = await EmployeeModel.findById(userId);
  if (!user) {
    return res.status(404).json({ Message: "User not found" });
  }

  user.bookmarks = user.bookmarks.filter(
    (bookmark) => bookmark.toString() !== productId
  );
  await user.save();

  res.status(200).json({ Message: "Product unbookmarked successfully" });
});

/**
 * @desc Get all bookmarked products for a user
 * @route GET /api/bookmarks
 * @access Private
 */
const getBookmarks = asyncHandler(async (req, res) => {
  const userId = req.tokenKey.uid;

  const user = await EmployeeModel.findById(userId).populate("bookmarks");
  if (!user) {
    return res.status(404).json({ Message: "User not found" });
  }

  res.status(200).json(user.bookmarks);
});

/**
 * @desc Add a product to user's cart
 * @route POST /api/cart/:productId
 * @access Private
 */
const addCartItem = asyncHandler(async (req, res) => {
  const userId = req.tokenKey.uid;
  const { productId } = req.params;
  const { quantity = 1 } = req.body;

  const user = await EmployeeModel.findById(userId);
  if (!user) {
    return res.status(404).json({ Message: "User not found" });
  }

  const cartItemIndex = user.cart.findIndex(
    (item) => item.productId.toString() === productId
  );

  if (cartItemIndex > -1) {
    user.cart[cartItemIndex].quantity += quantity;
  } else {
    user.cart.push({ productId, quantity });
  }
  await user.save();

  res.status(200).json({ Message: "Product added to cart successfully" });
});

/**
 * @desc Remove a product from user's cart
 * @route DELETE /api/cart/:productId
 * @access Private
 */
const removeCartItem = asyncHandler(async (req, res) => {
  const userId = req.tokenKey.uid;
  const { productId } = req.params;

  const user = await EmployeeModel.findById(userId);
  if (!user) {
    return res.status(404).json({ Message: "User not found" });
  }

  user.cart = user.cart.filter((item) => item.productId.toString() !== productId);
  await user.save();

  res.status(200).json({ Message: "Product removed from cart successfully" });
});

/**
 * @desc Get all cart items for a user
 * @route GET /api/cart
 * @access Private
 */
const getCartItems = asyncHandler(async (req, res) => {
  const userId = req.tokenKey.uid;

  const user = await EmployeeModel.findById(userId).populate("cart.productId");
  if (!user) {
    return res.status(404).json({ Message: "User not found" });
  }

  res.status(200).json(user.cart);
});
