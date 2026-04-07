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
import menuRouter from "./routers/menuRouter.js";
import products from "./controllers/products.js";
import errorHandler from "./middleware/errorHandling.js";
import { loginValidation, orderValidation, otpSendValidation, otpVerifyValidation } from "./middleware/expressValidator.js";
import {
  login,
  refresh,
  logout,
  me,
  updateAvatar,
  forgotPassword,
  verifyForgotOtp,
  resetPassword,
} from "./controllers/authController.js";
import { verifyAccessToken, requireRole } from "./middleware/auth.js";
import { setOtp, verifyOtp } from "./services/otpStore.js";
import {
  sendSmsOtp,
  sendWhatsAppOtp,
  sendEmailOtp,
} from "./services/otpService.js";
import passport from "passport";
import { initPassport } from "./config/passport.js";
import { oauthCallback, oauthFailure } from "./controllers/oauthController.js";
import morgan from "morgan";
import requestId from "./middleware/requestId.js";
import logger from "./logging/logger.js";
import { issueCsrf, checkCsrf } from "./middleware/csrf.js";
import newsletterRouter from "./routers/newsletterRouter.js";
import adminRouter from "./routers/adminRouter.js";
import { sendToAll as sendNewsletterToAll } from "./services/newsletterService.js";
import Order from "./models/OrderModel.js";

dotenv.config();

// Initialize MongoDB database connection
dbConnection();

const app = express();
const port = process.env.PORT || 1234;

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
  (process.env.FRONTEND_URL || "http://localhost:3002").replace(/\/$/, ""),
  "https://gbr-kitchen.onrender.com",
  "http://localhost:3000",
  "http://localhost:3001",
]);
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      // Remove trailing slash for comparison
      const normalizedOrigin = origin.replace(/\/$/, "");
      if (allowedOrigins.has(normalizedOrigin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);
app.use(
  helmet({
    hsts: process.env.NODE_ENV === "production",
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);
app.use(express.json({ limit: "5mb" }));
app.use(cookieParser());
app.use(compression());

// Custom response header for performance monitoring
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.debug(`${req.method} ${req.originalUrl} [${res.statusCode}] - ${duration}ms`);
  });
  next();
});

app.use(requestId);
morgan.token("id", (req) => req.id);
app.use(
  morgan(":id :method :url :status :res[content-length] - :response-time ms"),
);
initPassport();
app.use(passport.initialize());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
  }),
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
app.post("/api/auth/login", loginLimiter, loginValidation, login);
app.get("/api/auth/refresh", refresh);
app.post("/api/auth/logout", checkCsrf, logout);
app.get("/api/auth/me", me);
app.patch("/api/auth/avatar", verifyAccessToken, checkCsrf, updateAvatar);
app.post("/api/auth/forgot-password", forgotPassword);
app.post("/api/auth/verify-forgot-otp", verifyForgotOtp);
app.post("/api/auth/reset-password", resetPassword);
// OAuth routes (activate only if env is provided)
app.get(
  "/api/oauth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  }),
);
app.get(
  "/api/oauth/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/api/oauth/failure",
  }),
  oauthCallback,
);
app.get(
  "/api/oauth/github",
  passport.authenticate("github", { scope: ["user:email"], session: false }),
);
app.get(
  "/api/oauth/github/callback",
  passport.authenticate("github", {
    session: false,
    failureRedirect: "/api/oauth/failure",
  }),
  oauthCallback,
);
app.get("/api/oauth/failure", oauthFailure);

// Menu and product routes
app.use("/api/menu", menuRouter);
app.get("/products", (req, res) => {
  res.json(products);
});

// Example admin-only endpoint (RBAC demo)
app.get(
  "/api/admin/metrics",
  verifyAccessToken,
  requireRole("admin"),
  (req, res) => {
    res.json({ uptime: process.uptime(), memory: process.memoryUsage() });
  },
);

// CSRF token issue
app.get("/api/csrf", issueCsrf);

// Newsletter
app.use("/api/newsletter", newsletterRouter);

// Admin routes
app.use("/api/admin", adminRouter);
app.post("/api/admin/broadcast-newsletter", requireRole("admin"), async (req, res) => {
  try {
    const { subject, body } = req.body;
    await sendNewsletterToAll(subject, body);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Orders
app.post("/api/order", verifyAccessToken, checkCsrf, orderValidation, async (req, res) => {
  const { items = [], paymentId = "", subtotal = 0, gst = 0, grandTotal = 0 } = req.body || {};
  try {
    const userEmail = req.tokenKey?.uemail;
    if (items.length) {
      await Order.create({ userEmail, paymentId, items, subtotal, gst, grandTotal });
    }
  } catch (err) {
    console.error("failed to save order", err);
  }
  res.json({ ok: true });
});

// OTP Routes
app.post("/api/otp/send", otpSendValidation, async (req, res) => {
  const { channel, contact } = req.body;
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  setOtp(contact, code);

  // Respond immediately — email sends in background (fire-and-forget)
  // This prevents Render's SMTP port throttling from blocking the response
  res.json({ ok: true });

  try {
    if (channel === "sms") await sendSmsOtp({ to: contact, code });
    else if (channel === "whatsapp") await sendWhatsAppOtp({ to: contact, code });
    else await sendEmailOtp({ to: contact, code });
  } catch (err) {
    console.error("[OTP send background error]", err.message);
  }
});

app.post("/api/otp/verify", otpVerifyValidation, (req, res) => {
  const { contact, code } = req.body;
  const isValid = verifyOtp(contact, code);
  res.json({ ok: isValid });
});

// Serve static files in production
const currentFileDir = path.dirname(fileURLToPath(import.meta.url));
const buildPath = path.resolve(currentFileDir, "..", "Front-end", "dist");

if (process.env.NODE_ENV === "production") {
  // Check if the build folder exists
  import("fs").then((fs) => {
    if (fs.existsSync(buildPath)) {
      app.use(express.static(buildPath));
      app.get("*", (req, res) => {
        res.sendFile(path.join(buildPath, "index.html"), (err) => {
          if (err) {
            res.status(500).send("Error loading index.html: Build missing or path incorrect.");
          }
        });
      });
    } else {
      console.warn(`Static build folder not found at: ${buildPath}`);
      app.get("*", (req, res) => {
        res.status(503).send("Frontend build not found. Please run build script.");
      });
    }
  });
} else {
  // In development, provide a simple health check or redirect if not handled by Vite
  app.get("/", (req, res) => {
    res.json({ message: "Backend API is running. Start Frontend separately for development." });
  });
}

// Error handling middleware
app.use(errorHandler);

// Start the server
app.listen(port, () => {
  console.log(`Worker ${process.pid} listening on port ${port}`);
});
