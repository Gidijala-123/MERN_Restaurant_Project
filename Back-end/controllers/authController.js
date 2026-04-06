import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import EmployeeModel from "../models/EmployeeModel.js";

dotenv.config();

const signAccess = (tokenKey) => {
  const secret = process.env.ACCESS_TOKEN || "bhargava@123";
  return jwt.sign({ tokenKey }, secret, { expiresIn: "15m" });
};

const signRefresh = (tokenKey) => {
  const secret =
    process.env.REFRESH_TOKEN ||
    process.env.ACCESS_TOKEN ||
    "bhargava_refresh@123";
  return jwt.sign({ tokenKey }, secret, { expiresIn: "7d" });
};

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
  const isProd = process.env.NODE_ENV === "production";
  res
    .cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      maxAge: 15 * 60 * 1000,
    })
    .cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    .json({
      message: "ok",
      user: {
        uname: user.uname,
        uemail: user.uemail,
        uid: user._id,
        role: user.role || "user",
        avatar: user.avatar || "",
      },
    });
});

export const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;

  // Return 200 even when refresh token is missing/invalid to avoid noisy browser errors.
  // Client should treat authenticated=false as a sign that the session is gone.
  if (!token) return res.status(200).json({ authenticated: false });

  try {
    const secret =
      process.env.REFRESH_TOKEN ||
      process.env.ACCESS_TOKEN ||
      "bhargava_refresh@123";
    const { tokenKey } = jwt.verify(token, secret);
    const accessToken = signAccess(tokenKey);
    const isProd = process.env.NODE_ENV === "production";
    res
      .cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? "none" : "lax",
        maxAge: 15 * 60 * 1000,
      })
      .json({ authenticated: true });
  } catch {
    return res.status(200).json({ authenticated: false });
  }
});

export const logout = asyncHandler(async (req, res) => {
  const isProd = process.env.NODE_ENV === "production";
  const options = {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
  };
  res
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json({ message: "logged out" });
});

export const me = asyncHandler(async (req, res) => {
  // Determine whether the user is authenticated based on the accessToken cookie.
  // Always return 200 so the frontend doesn’t log a 401 in the console.
  const token = req.cookies?.accessToken;
  if (!token) return res.status(200).json({ authenticated: false });

  try {
    const secret = process.env.ACCESS_TOKEN || "bhargava@123";
    const decoded = jwt.verify(token, secret);
    const tokenKey = decoded?.tokenKey;
    const uid = tokenKey?.uid;
    if (!uid) return res.status(200).json({ authenticated: false });

    // OAuth users have a provider-issued uid (not a MongoDB ObjectId).
    // Try findById first; if it fails (cast error), fall back to tokenKey data.
    let user = null;
    try {
      user = await EmployeeModel.findById(uid).select("avatar uname uemail role");
    } catch {
      // uid is not a valid ObjectId (e.g. Google/GitHub profile id) — that's fine
    }

    res.json({
      authenticated: true,
      ...tokenKey,
      avatar: user?.avatar || "",
      uname: user?.uname || tokenKey?.uname,
    });
  } catch {
    return res.status(200).json({ authenticated: false });
  }
});

export const updateAvatar = asyncHandler(async (req, res) => {
  const uid = req.tokenKey?.uid;
  const { avatar } = req.body || {};
  if (!uid) return res.status(401).json({ message: "Unauthorized" });
  if (!avatar || typeof avatar !== "string")
    return res.status(400).json({ message: "avatar string required" });
  await EmployeeModel.findByIdAndUpdate(uid, { avatar });
  res.json({ ok: true });
});
