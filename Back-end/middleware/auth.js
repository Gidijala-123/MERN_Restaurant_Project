import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const verifyAccessToken = (req, res, next) => {
  const token =
    req.cookies?.accessToken ||
    (req.headers.authorization || "").replace("Bearer ", "");
  if (!token) return res.status(401).json({ message: "Unauthorized" });
  try {
    const secret = process.env.ACCESS_TOKEN || "bhargava@123";
    const decoded = jwt.verify(token, secret);
    req.tokenKey = decoded.tokenKey;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
};

export const requireRole = (...roles) => (req, res, next) => {
  const role = req.tokenKey?.role || "user";
  if (!roles.includes(role)) return res.status(403).json({ message: "Forbidden" });
  next();
};

