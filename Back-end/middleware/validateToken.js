import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const validateToken = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (authHeader && authHeader.startsWith("Bearer")) {
    const token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.ACCESS_TOKEN, (err, decodedToken) => {
      if (err) return res.status(401).json({ Message: "Invalid or expired token" });
      req.tokenKey = decodedToken.tokenKey;
      next();
    });
  } else {
    return res.status(401).json({ Message: "Authentication required" });
  }
});

export default validateToken;
