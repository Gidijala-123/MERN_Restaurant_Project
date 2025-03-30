const express = require("express");
const cors = require("cors");
const path = require("path");
const dbConnection = require("./config/dbConfig");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 1111;

// Start the server
app.listen(port, () => {
  console.log("Server started at PORT :", port);
});

// Connect to the database
dbConnection();

// Middleware
const errorHandler = require("./middleware/errorHandling");
app.use(errorHandler);
app.use(cors());
app.use(express.json());

// API routes
app.use("/api/signupLoginRouter", require("./routers/signupLoginRouter"));

const products = require("./controllers/products");
app.get("/products", (req, res) => {
  res.send(products);
});

// Serve static files from the React app
const buildPath = path.join(__dirname, "../Front-end/build");
app.use(express.static(buildPath));

// Catch-all handler to serve React's `index.html` for unknown routes
app.get("*", (req, res) => {
  res.sendFile(path.join(buildPath, "index.html"));
});
