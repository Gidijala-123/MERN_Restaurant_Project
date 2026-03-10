import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";

const signAccess = (tokenKey) =>
  jwt.sign({ tokenKey }, process.env.ACCESS_TOKEN, { expiresIn: "15m" });
const signRefresh = (tokenKey) =>
  jwt.sign({ tokenKey }, process.env.REFRESH_TOKEN, { expiresIn: "7d" });

export const oauthCallback = asyncHandler(async (req, res) => {
  const tokenKey = req.user;
  if (!tokenKey) return res.status(400).json({ message: "OAuth failed" });
  const accessToken = signAccess(tokenKey);
  const refreshToken = signRefresh(tokenKey);
  res
    .cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60 * 1000,
    })
    .cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  const target =
    process.env.FRONTEND_URL || "http://localhost:3002/home";
  res.redirect(target);
});

export const oauthFailure = asyncHandler(async (req, res) => {
  res.status(401).json({ message: "OAuth failure" });
});
