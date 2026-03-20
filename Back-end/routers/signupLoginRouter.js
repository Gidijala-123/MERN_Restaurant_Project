import express from "express";
import validateToken from "../middleware/validateToken.js";
import { signupValidation, loginValidation } from "../middleware/expressValidator.js";
import {
  registerUser,
  loginUser,
  getCurrentUser,
  addBookmark,
  removeBookmark,
  getBookmarks,
  addCartItem,
  removeCartItem,
  getCartItems,
} from "../controllers/signupLoginController.js";

const router = express.Router();

router
  .post("/registerUser", signupValidation, registerUser)
  .post("/loginUser", loginValidation, loginUser)
  .get("/getCurrentUser", validateToken, getCurrentUser)
  .post("/bookmark/:productId", validateToken, addBookmark)
  .delete("/bookmark/:productId", validateToken, removeBookmark)
  .get("/bookmarks", validateToken, getBookmarks)
  .post("/cart/:productId", validateToken, addCartItem)
  .delete("/cart/:productId", validateToken, removeCartItem)
  .get("/cart", validateToken, getCartItems);

export default router;
