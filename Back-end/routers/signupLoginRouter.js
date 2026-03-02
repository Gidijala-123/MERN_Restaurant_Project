import express from "express";
import validateToken from "../middleware/validateToken.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { signupSchema, loginSchema } from "../validations/schemas.js";
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
  .post("/registerUser", validateRequest(signupSchema), registerUser)
  .post("/loginUser", validateRequest(loginSchema), loginUser)
  .get("/getCurrentUser", validateToken, getCurrentUser)
  .post("/bookmark/:productId", validateToken, addBookmark)
  .delete("/bookmark/:productId", validateToken, removeBookmark)
  .get("/bookmarks", validateToken, getBookmarks)
  .post("/cart/:productId", validateToken, addCartItem)
  .delete("/cart/:productId", validateToken, removeCartItem)
  .get("/cart", validateToken, getCartItems);

export default router;
