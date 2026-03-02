import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import dbConnection from "./config/dbConfig.js";
import signupLoginRouter from "./routers/signupLoginRouter.js";
import products from "./controllers/products.js";
import errorHandler from "./middleware/errorHandling.js";

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
app.use(
  cors({
    origin: "https://mern-restaurant-project-1-n4oh.onrender.com",
    credentials: true,
  })
); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Body parser for JSON data

/**
 * API Routes
 */
// Authentication and user routes
app.use("/api/signupLoginRouter", signupLoginRouter);

// Simple route to fetch product data
app.get("/products", (req, res) => {
  res.send(products);
});

/**
 * Error handling middleware (should be after routes)
 */
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
 * Start Express server
 */
app.listen(port, () => {
  console.log(`🚀 Server 2026 running on port: ${port}`);
});
