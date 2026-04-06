import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import EmployeeModel from "../models/EmployeeModel.js";
import { setOtp, verifyOtp } from "../services/otpStore.js";
import { sendEmailOtp } from "../services/otpService.js";

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

export const forgotPassword = asyncHandler(async (req, res) => {
  const { uemail } = req.body;
  console.log("[forgotPassword] called with uemail:", uemail);
  if (!uemail) return res.status(400).json({ message: "Email is required" });

  const normalizedEmail = uemail.toLowerCase().trim();
  const user = await EmployeeModel.findOne({ uemail: { $regex: new RegExp(`^${normalizedEmail}$`, "i") } });
  console.log("[forgotPassword] user found:", user ? user.uemail : "NOT FOUND");
  if (!user) return res.status(404).json({ message: "No account found with this email" });

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  console.log("[forgotPassword] generated OTP code:", code);
  setOtp(user.uemail, code);
  console.log("[forgotPassword] OTP stored, now calling sendEmailOtp to:", user.uemail);
  console.log("[forgotPassword] ENV CHECK - OTP_PROVIDER:", process.env.OTP_PROVIDER);
  console.log("[forgotPassword] ENV CHECK - SMTP_SERVICE:", process.env.SMTP_SERVICE);
  console.log("[forgotPassword] ENV CHECK - SMTP_USER:", process.env.SMTP_USER);
  console.log("[forgotPassword] ENV CHECK - SMTP_PASS length:", process.env.SMTP_PASS?.length);
  console.log("[forgotPassword] ENV CHECK - EMAIL_FROM:", process.env.EMAIL_FROM);

  try {
    const result = await sendEmailOtp({ to: user.uemail, code });
    console.log("[forgotPassword] sendEmailOtp result:", JSON.stringify(result));
  } catch (err) {
    console.error("[forgotPassword] sendEmailOtp THREW ERROR:", err.message, err.stack);
  }

  res.json({ ok: true });
});

export const verifyForgotOtp = asyncHandler(async (req, res) => {
  const { uemail, code } = req.body;
  if (!uemail || !code) return res.status(400).json({ message: "Email and OTP are required" });

  const user = await EmployeeModel.findOne({ uemail: { $regex: new RegExp(`^${uemail.trim()}$`, "i") } });
  if (!user) return res.status(400).json({ message: "Invalid or expired OTP" });

  const valid = verifyOtp(user.uemail, String(code).trim());
  if (!valid) return res.status(400).json({ message: "Invalid or expired OTP" });

  // Issue a short-lived reset token (5 min)
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

  if (payload.purpose !== "reset")
    return res.status(400).json({ message: "Invalid reset token" });

  const hashed = await bcrypt.hash(newPassword, 10);
  await EmployeeModel.findOneAndUpdate({ uemail: payload.uemail }, { upassword: hashed });
  res.json({ ok: true });
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
