import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import EmployeeModel from "../models/EmployeeModel.js";

dotenv.config();

const signAccess = (tokenKey) =>
  jwt.sign({ tokenKey }, process.env.ACCESS_TOKEN, { expiresIn: "15m" });
const signRefresh = (tokenKey) =>
  jwt.sign({ tokenKey }, process.env.REFRESH_TOKEN, { expiresIn: "7d" });

export const login = asyncHandler(async (req, res) => {
  const { uemail, upassword } = req.body;
  const user = await EmployeeModel.findOne({ uemail });
  if (!user || !(await bcrypt.compare(upassword, user.upassword))) {
    return res.status(401).json({ message: "Invalid credentials" });
  }
  const tokenKey = {
    uname: user.uname,
    uemail: user.uemail,
    uid: user.id,
    role: user.role || "user",
  };
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
    })
    .json({ message: "ok" });
});

export const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token) return res.status(401).json({ message: "Unauthorized" });
  try {
    const { tokenKey } = jwt.verify(token, process.env.REFRESH_TOKEN);
    const accessToken = signAccess(tokenKey);
    res
      .cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 15 * 60 * 1000,
      })
      .json({ message: "refreshed" });
  } catch {
    return res.status(401).json({ message: "Invalid refresh token" });
  }
});

export const logout = asyncHandler(async (req, res) => {
  res
    .clearCookie("accessToken")
    .clearCookie("refreshToken")
    .json({ message: "logged out" });
});

export const me = asyncHandler(async (req, res) => {
  res.json(req.tokenKey);
});
