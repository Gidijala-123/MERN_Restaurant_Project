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
  login, refresh, logout, me,
  updateAvatar, updateProfile,
  getProfileSettings, saveProfileSettings,
  getCart, saveCart,
  getFavorites, toggleFavorite, setFavorites,
  forgotPassword, verifyForgotOtp, resetPassword,
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
import MenuItem from "./models/MenuModel.js";

dotenv.config();

// Initialize MongoDB database connection
dbConnection();

// Auto-seed menu data if DB has fewer than 60 items
async function seedMenuIfEmpty() {
  try {
    const count = await MenuItem.countDocuments();
    logger.info(`[Seed] ${count} menu items in DB — checking for missing items...`);
    const { MENU_DATA: SEED } = await import("../Front-end/src/data/menuData.js").catch(() => ({}));
    if (!SEED?.length) return;
    const docs = SEED.map((item) => ({
      itemId: item.id,
      name: item.name,
      category: item.category,
      subCategory: item.subCategory,
      price: item.price,
      rating: item.rating ?? 4.0,
      reviews: item.reviews ?? 0,
      calories: item.calories ?? 0,
      serves: item.serves ?? 1,
      imageUrl: item.imageUrl || "/footer-images/food.png",
      description: item.description || "",
      veg: item.veg ?? true,
      availability: true,
      isHotOffer: false,
    }));
    // Upsert: insert only if itemId doesn't exist — preserves admin edits
    let seeded = 0;
    for (const doc of docs) {
      const result = await MenuItem.updateOne(
        { itemId: doc.itemId },
        { $setOnInsert: doc },
        { upsert: true }
      );
      if (result.upsertedCount) seeded++;
    }
    logger.info(`[Seed] Upserted ${seeded} new menu items (${docs.length - seeded} already existed).`);
  } catch (err) {
    logger.warn("[Seed] Auto-seed skipped:", err.message);
  }
}

// Run after DB connection stabilises
setTimeout(seedMenuIfEmpty, 4000);

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
  "https://mern-restaurant-proj.com",
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

// ── Cache-Control headers ─────────────────────────────────────────────────
// All API routes return dynamic data — never cache by default.
// Menu routes get a short 60s cache since they change infrequently.
app.use("/api/menu", (req, res, next) => {
  if (req.method === "GET") res.set("Cache-Control", "public, max-age=60");
  else res.set("Cache-Control", "no-store");
  next();
});
app.use("/api", (req, res, next) => {
  // Only set if not already set (menu routes above already set theirs)
  if (!res.getHeader("Cache-Control")) res.set("Cache-Control", "no-store");
  next();
});

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
    max: 500,
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
      // Don't rate-limit read-only endpoints that fire on every page load
      const skipPaths = ["/api/csrf", "/api/auth/me", "/api/auth/refresh", "/api/menu", "/api/auth/cart", "/api/auth/favorites", "/health"];
      return skipPaths.some((p) => req.path.startsWith(p)) && req.method === "GET";
    },
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
app.patch("/api/auth/profile", verifyAccessToken, checkCsrf, updateProfile);
app.get("/api/auth/profile/settings", verifyAccessToken, getProfileSettings);
app.patch("/api/auth/profile/settings", verifyAccessToken, checkCsrf, saveProfileSettings);
app.get("/api/auth/cart", verifyAccessToken, getCart);
app.patch("/api/auth/cart", verifyAccessToken, checkCsrf, saveCart);
app.get("/api/auth/favorites", verifyAccessToken, getFavorites);
app.patch("/api/auth/favorites/:itemId", verifyAccessToken, checkCsrf, toggleFavorite);
app.put("/api/auth/favorites", verifyAccessToken, checkCsrf, setFavorites);
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

// Orders — user's own order history
app.get("/api/orders/my", verifyAccessToken, async (req, res) => {
  const userEmail = req.tokenKey?.uemail;
  if (!userEmail) return res.status(401).json({ message: "Unauthorized" });
  const orders = await Order.find({ userEmail }).sort({ createdAt: -1 }).lean();
  res.json({ orders });
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
    logger.error("failed to save order", err);
  }
  res.json({ ok: true });
});

// OTP Routes
app.post("/api/otp/send", otpSendValidation, async (req, res) => {
  const { channel, contact } = req.body;
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  setOtp(contact, code);

  try {
    let result;
    if (channel === "sms") result = await sendSmsOtp({ to: contact, code });
    else if (channel === "whatsapp") result = await sendWhatsAppOtp({ to: contact, code });
    else result = await sendEmailOtp({ to: contact, code });

    if (result && result.ok) {
      return res.json({ ok: true, provider: result.provider });
    } else {
      throw new Error(result?.error || "Provider failed to send");
    }
  } catch (err) {
    logger.error("[OTP send error]", err.message);
    // Return 500 so frontend knows it failed
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.post("/api/otp/verify", otpVerifyValidation, (req, res) => {
  const { contact, code } = req.body;
  const isValid = verifyOtp(contact, code);
  res.json({ ok: isValid });
});

// Serve static files in production
const currentFileDir = path.dirname(fileURLToPath(import.meta.url));
// Try both relative to Back-end and relative to root
const buildPaths = [
  path.resolve(currentFileDir, "..", "Front-end", "dist"),
  path.resolve(process.cwd(), "Front-end", "dist"),
  path.resolve(process.cwd(), "dist"),
];

if (process.env.NODE_ENV === "production") {
  import("fs").then((fs) => {
    const buildPath = buildPaths.find(p => fs.existsSync(p));

    if (buildPath) {
      logger.info(`Serving static files from: ${buildPath}`);
      // Serve static assets (JS, CSS, images) with correct MIME types
      app.use(express.static(buildPath, { index: false }));
      // SPA fallback — all non-API routes return index.html so React Router works on direct reload
      app.get("*", (req, res, next) => {
        if (req.path.startsWith("/api/") || req.path === "/health") return next();
        res.sendFile(path.join(buildPath, "index.html"), (err) => {
          if (err) res.status(500).send("Error loading app.");
        });
      });
    } else {
      logger.warn(`Static build folder not found. Checked: ${buildPaths.join(", ")}`);
      app.get("*", (req, res) => {
        res.status(503).send(`Frontend build not found. Please ensure 'npm run build' was executed. Checked: ${buildPaths[0]}`);
      });
    }
  });
} else {
  app.get("/", (req, res) => {
    res.json({ message: "Backend API is running. Start Frontend separately for development." });
  });
}

// Error handling middleware
app.use(errorHandler);

// Start the server
app.listen(port, () => {
  logger.info(`Worker ${process.pid} listening on port ${port}`);
});
