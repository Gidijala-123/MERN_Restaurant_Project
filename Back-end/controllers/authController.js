import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import EmployeeModel from "../models/EmployeeModel.js";
import { setOtp, verifyOtp } from "../services/otpStore.js";
import { sendEmailOtp } from "../services/otpService.js";

dotenv.config();

// ── Helpers ────────────────────────────────────────────────────────────────

const signAccess = (tokenKey) => {
  const secret = process.env.ACCESS_TOKEN || "bhargava@123";
  return jwt.sign({ tokenKey }, secret, { expiresIn: "15m" });
};

const signRefresh = (tokenKey) => {
  const secret = process.env.REFRESH_TOKEN || process.env.ACCESS_TOKEN || "bhargava_refresh@123";
  return jwt.sign({ tokenKey }, secret, { expiresIn: "7d" });
};

// Safe email lookup — always lowercase, no regex, works with any special chars
const findUserByEmail = (email) =>
  EmployeeModel.findOne({ uemail: email.toLowerCase().trim() });

// ── Auth handlers ──────────────────────────────────────────────────────────

export const login = asyncHandler(async (req, res) => {
  const { uemail, upassword } = req.body;
  const user = await findUserByEmail(uemail);
  if (!user || !(await bcrypt.compare(upassword, user.upassword))) {
    return res.status(401).json({ message: "Invalid credentials" });
  }
  const tokenKey = { uname: user.uname, uemail: user.uemail, uid: user.id, role: user.role || "user" };
  const accessToken = signAccess(tokenKey);
  const refreshToken = signRefresh(tokenKey);
  const isProd = process.env.NODE_ENV === "production";
  res
    .cookie("accessToken", accessToken, { httpOnly: true, secure: isProd, sameSite: isProd ? "none" : "lax", maxAge: 15 * 60 * 1000 })
    .cookie("refreshToken", refreshToken, { httpOnly: true, secure: isProd, sameSite: isProd ? "none" : "lax", maxAge: 7 * 24 * 60 * 60 * 1000 })
    .json({ message: "ok", user: { uname: user.uname, uemail: user.uemail, uid: user._id, role: user.role || "user", avatar: user.avatar || "" } });
});

export const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token) return res.status(200).json({ authenticated: false });
  try {
    const secret = process.env.REFRESH_TOKEN || process.env.ACCESS_TOKEN || "bhargava_refresh@123";
    const { tokenKey } = jwt.verify(token, secret);
    const accessToken = signAccess(tokenKey);
    const isProd = process.env.NODE_ENV === "production";
    res
      .cookie("accessToken", accessToken, { httpOnly: true, secure: isProd, sameSite: isProd ? "none" : "lax", maxAge: 15 * 60 * 1000 })
      .json({ authenticated: true });
  } catch {
    return res.status(200).json({ authenticated: false });
  }
});

export const logout = asyncHandler(async (req, res) => {
  const isProd = process.env.NODE_ENV === "production";
  const options = { httpOnly: true, secure: isProd, sameSite: isProd ? "none" : "lax" };
  res.clearCookie("accessToken", options).clearCookie("refreshToken", options).json({ message: "logged out" });
});

export const me = asyncHandler(async (req, res) => {
  const token = req.cookies?.accessToken;
  if (!token) return res.status(200).json({ authenticated: false });
  try {
    const secret = process.env.ACCESS_TOKEN || "bhargava@123";
    const decoded = jwt.verify(token, secret);
    const tokenKey = decoded?.tokenKey;
    const uid = tokenKey?.uid;
    if (!uid) return res.status(200).json({ authenticated: false });
    let user = null;
    try {
      user = await EmployeeModel.findById(uid).select("avatar uname uemail role");
    } catch {
      // uid is not a valid ObjectId (OAuth provider id) — fine
    }
    res.json({ authenticated: true, ...tokenKey, avatar: user?.avatar || "", uname: user?.uname || tokenKey?.uname });
  } catch {
    return res.status(200).json({ authenticated: false });
  }
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { uemail } = req.body;
  if (!uemail) return res.status(400).json({ message: "Email is required" });

  const user = await findUserByEmail(uemail);
  if (!user) return res.status(404).json({ message: "No account found with this email" });

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  setOtp(user.uemail, code);

  // Respond immediately — email sends in background
  res.json({ ok: true });

  sendEmailOtp({ to: user.uemail, code }).catch((err) =>
    console.error("[forgotPassword] email error:", err.message)
  );
});

export const verifyForgotOtp = asyncHandler(async (req, res) => {
  const { uemail, code } = req.body;
  if (!uemail || !code) return res.status(400).json({ message: "Email and OTP are required" });

  const user = await findUserByEmail(uemail);
  if (!user) return res.status(400).json({ message: "Invalid or expired OTP" });

  const valid = verifyOtp(user.uemail, String(code).trim());
  if (!valid) return res.status(400).json({ message: "Invalid or expired OTP" });

  const resetToken = jwt.sign(
    { uemail: user.uemail, purpose: "reset" },
    process.env.ACCESS_TOKEN || "bhargava@123",
    { expiresIn: "5m" }
  );
  res.json({ ok: true, resetToken });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { resetToken, newPassword } = req.body;
  if (!resetToken || !newPassword)
    return res.status(400).json({ message: "Reset token and new password are required" });

  let payload;
  try {
    payload = jwt.verify(resetToken, process.env.ACCESS_TOKEN || "bhargava@123");
  } catch {
    return res.status(400).json({ message: "Reset link expired. Please start over." });
  }

  if (payload.purpose !== "reset") return res.status(400).json({ message: "Invalid reset token" });

  const hashed = await bcrypt.hash(newPassword, 10);
  await EmployeeModel.findOneAndUpdate({ uemail: payload.uemail }, { upassword: hashed });
  res.json({ ok: true });
});

export const updateAvatar = asyncHandler(async (req, res) => {
  const uid = req.tokenKey?.uid;
  const { avatar } = req.body || {};
  if (!uid) return res.status(401).json({ message: "Unauthorized" });
  if (!avatar || typeof avatar !== "string") return res.status(400).json({ message: "avatar string required" });
  await EmployeeModel.findByIdAndUpdate(uid, { avatar });
  res.json({ ok: true });
});
