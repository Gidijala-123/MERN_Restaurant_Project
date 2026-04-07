import asyncHandler from "express-async-handler";
import EmployeeModel from "../models/EmployeeModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

const registerUser = asyncHandler(async (req, res) => {
  const { uname, uemail, upassword, avatar = "" } = req.body;
  const existing = await EmployeeModel.findOne({ uemail });
  if (existing) return res.status(403).json({ Message: "User already exists..!" });

  const hashedPassword = await bcrypt.hash(upassword, 10);
  const newUser = await EmployeeModel.create({ uname, uemail, upassword: hashedPassword, role: "user", avatar });

  if (newUser) {
    return res.json({ Message: "User created successfully..!", id: newUser.id, uemail: newUser.uemail, avatar: newUser.avatar || "" });
  }
  return res.status(400).json({ Error: "Invalid user data" });
});

const loginUser = asyncHandler(async (req, res) => {
  const { uemail, upassword } = req.body;
  const validUser = await EmployeeModel.findOne({ uemail });
  if (validUser && (await bcrypt.compare(upassword, validUser.upassword))) {
    const secret = process.env.ACCESS_TOKEN || "bhargava@123";
    const generateToken = jwt.sign(
      { tokenKey: { uname: validUser.uname, uemail: validUser.uemail, uid: validUser.id } },
      secret,
      { expiresIn: "30m" }
    );
    return res.status(200).json({ "Access Token": generateToken });
  }
  return res.status(401).json({ Message: "Invalid email or password" });
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res.json(req.tokenKey);
});

const addBookmark = asyncHandler(async (req, res) => {
  const userId = req.tokenKey.uid;
  const { productId } = req.params;
  const user = await EmployeeModel.findById(userId);
  if (!user) return res.status(404).json({ Message: "User not found" });
  if (!user.bookmarks.includes(productId)) {
    user.bookmarks.push(productId);
    await user.save();
  }
  res.status(200).json({ Message: "Product bookmarked successfully" });
});

const removeBookmark = asyncHandler(async (req, res) => {
  const userId = req.tokenKey.uid;
  const { productId } = req.params;
  const user = await EmployeeModel.findById(userId);
  if (!user) return res.status(404).json({ Message: "User not found" });
  user.bookmarks = user.bookmarks.filter((b) => b.toString() !== productId);
  await user.save();
  res.status(200).json({ Message: "Product unbookmarked successfully" });
});

const getBookmarks = asyncHandler(async (req, res) => {
  const user = await EmployeeModel.findById(req.tokenKey.uid).populate("bookmarks");
  if (!user) return res.status(404).json({ Message: "User not found" });
  res.status(200).json(user.bookmarks);
});

const addCartItem = asyncHandler(async (req, res) => {
  const userId = req.tokenKey.uid;
  const { productId } = req.params;
  const { quantity = 1 } = req.body;
  const user = await EmployeeModel.findById(userId);
  if (!user) return res.status(404).json({ Message: "User not found" });
  const idx = user.cart.findIndex((item) => item.productId.toString() === productId);
  if (idx > -1) user.cart[idx].quantity += quantity;
  else user.cart.push({ productId, quantity });
  await user.save();
  res.status(200).json({ Message: "Product added to cart successfully" });
});

const removeCartItem = asyncHandler(async (req, res) => {
  const userId = req.tokenKey.uid;
  const { productId } = req.params;
  const user = await EmployeeModel.findById(userId);
  if (!user) return res.status(404).json({ Message: "User not found" });
  user.cart = user.cart.filter((item) => item.productId.toString() !== productId);
  await user.save();
  res.status(200).json({ Message: "Product removed from cart successfully" });
});

const getCartItems = asyncHandler(async (req, res) => {
  const user = await EmployeeModel.findById(req.tokenKey.uid).populate("cart.productId");
  if (!user) return res.status(404).json({ Message: "User not found" });
  res.status(200).json(user.cart);
});

export { registerUser, loginUser, getCurrentUser, addBookmark, removeBookmark, getBookmarks, addCartItem, removeCartItem, getCartItems };
