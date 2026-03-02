import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

/**
 * @desc Middleware to validate JWT token from authorization header
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const validateToken = asyncHandler(async (req, res, next) => {
  let token;
  // Check both lowercase and uppercase Authorization header
  const authHeader = req.headers.authorization || req.headers.Authorization;
  
  // Verify header format is "Bearer <token>"
  if (authHeader && authHeader.startsWith("Bearer")) {
    // Extract token string
    token = authHeader.split(" ")[1];
    
    // Verify the JWT token
    jwt.verify(token, process.env.ACCESS_TOKEN, (err, decodedToken) => {
      if (err) {
        return res.status(401).json({ Message: "Invalid or expired token" });
      }
      // Attach decoded user info to request object for use in protected routes
      req.tokenKey = decodedToken.tokenKey;
      next();
    });
  } else {
    // Return unauthorized if no Bearer token is present
    return res.status(401).json({ Message: "Authentication required" });
  }
});

export default validateToken;
