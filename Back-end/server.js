import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import compression from "compression";
import mongoose from "mongoose";
import dbConnection from "./config/dbConfig.js";
import signupLoginRouter from "./routers/signupLoginRouter.js";
import products from "./controllers/products.js";
import errorHandler from "./middleware/errorHandling.js";
import {
  login,
  refresh,
  logout,
  me,
  updateAvatar,
} from "./controllers/authController.js";
import { verifyAccessToken, requireRole } from "./middleware/auth.js";
import { setOtp, verifyOtp } from "./services/otpStore.js";
import { sendSmsOtp, sendWhatsAppOtp } from "./services/otpService.js";
import passport from "passport";
import { initPassport } from "./config/passport.js";
import { oauthCallback, oauthFailure } from "./controllers/oauthController.js";
import morgan from "morgan";
import requestId from "./middleware/requestId.js";
import logger from "./logging/logger.js";
import { issueCsrf, checkCsrf } from "./middleware/csrf.js";

dotenv.config();

// Setup for ES modules to handle directory paths
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 1111;

// Initialize MongoDB database connection
dbConnection();

/**
 * Middleware setup
 */
app.set("trust proxy", 1);
app.disable("x-powered-by");
const envOrigins = String(process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
const allowedOrigins = new Set([
  ...envOrigins,
  process.env.FRONTEND_URL || "http://localhost:3002",
  "https://gbr-kitchen.onrender.com",
  "http://localhost:3000",
  "http://localhost:3001",
]);
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.has(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use(
  helmet({
    hsts: process.env.NODE_ENV === "production",
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use(compression());
app.use(requestId);
morgan.token("id", (req) => req.id);
app.use(
  morgan(":id :method :url :status :res[content-length] - :response-time ms")
);
initPassport();
app.use(passport.initialize());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

/**
 * API Routes
 */
app.get("/health", (req, res) => {
  const states = ["disconnected", "connected", "connecting", "disconnecting"];
  const dbState = states[mongoose.connection.readyState] || "unknown";
  res.json({ ok: true, uptime: process.uptime(), db: dbState });
});
// Authentication and user routes
app.use("/api/signupLoginRouter", signupLoginRouter);
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
});
app.post("/api/auth/login", loginLimiter, login);
app.get("/api/auth/refresh", refresh);
app.post("/api/auth/logout", checkCsrf, logout);
app.get("/api/auth/me", verifyAccessToken, me);
app.patch("/api/auth/avatar", verifyAccessToken, checkCsrf, updateAvatar);
// OAuth routes (activate only if env is provided)
app.get(
  "/api/oauth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);
app.get(
  "/api/oauth/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/api/oauth/failure",
  }),
  oauthCallback
);
app.get(
  "/api/oauth/github",
  passport.authenticate("github", { scope: ["user:email"], session: false })
);
app.get(
  "/api/oauth/github/callback",
  passport.authenticate("github", {
    session: false,
    failureRedirect: "/api/oauth/failure",
  }),
  oauthCallback
);
app.get("/api/oauth/failure", oauthFailure);

// Simple route to fetch product data
app.get("/products", verifyAccessToken, (req, res) => {
  res.set("Cache-Control", "public, max-age=60");
  res.send(products);
});

// Example admin-only endpoint (RBAC demo)
app.get(
  "/api/admin/metrics",
  verifyAccessToken,
  requireRole("admin"),
  (req, res) => {
    res.json({ uptime: process.uptime(), memory: process.memoryUsage() });
  }
);

// CSRF token issue
app.get("/api/csrf", issueCsrf);

// Orders (example producer entrypoint)
app.post("/api/order", verifyAccessToken, checkCsrf, async (req, res) => {
  res.json({ ok: true });
});

// OTP endpoints with limiter
const otpLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 5 });
app.post("/api/otp/send", otpLimiter, checkCsrf, async (req, res) => {
  const { to, channel = "sms" } = req.body || {};
  if (!to) return res.status(400).json({ message: "recipient required" });
  const code = Math.floor(100000 + Math.random() * 900000);
  setOtp(to, code);
  const send = channel === "whatsapp" ? sendWhatsAppOtp : sendSmsOtp;
  await send({ to, code });
  res.json({ ok: true });
});
app.post("/api/otp/verify", otpLimiter, checkCsrf, async (req, res) => {
  const { to, code } = req.body || {};
  if (!to || !code)
    return res.status(400).json({ message: "to and code required" });
  const ok = verifyOtp(to, code);
  res.json({ ok });
});

/**
 * Error handling middleware (should be after routes)
 */
app.use((req, res) => {
  res.status(404).json({ message: "Not Found" });
});
app.use(errorHandler);

/**
 * Static file serving for Frontend (React/Vite)
 */
// Path to the compiled frontend assets
// const buildPath = path.join(__dirname, "../Front-end/build");
// app.use(express.static(buildPath));

// // Catch-all handler to support client-side routing in React
// app.get("*", (req, res) => {
//   res.sendFile(path.join(buildPath, "index.html"));
// });

/**
 * Start Express server with automatic port fallback
 */
const start = (p) => {
  const server = app.listen(p, () => {
    logger.info({ msg: "server_started", port: p });
  });
  server.on("error", (err) => {
    if (err?.code === "EADDRINUSE") {
      const next = p + 1;
      logger.warn({ msg: "port_in_use", port: p, retry: next });
      start(next);
    } else {
      throw err;
    }
  });
};
start(port);
