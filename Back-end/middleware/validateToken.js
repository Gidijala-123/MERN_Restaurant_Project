const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const validateToken = asyncHandler(async (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (authHeader && authHeader.startsWith("Bearer")) {
    token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.ACCESS_TOKEN, (err, decodedToken) => {
      if (err) {
        return res.json("Invalid token");
      }
      req.tokenKey = decodedToken.tokenKey;
      next();
    });
    if (!token) {
      return res.json({ Message: "Unauthorized user" });
    }
  } else {
    return res.json({ Message: "Authentication required" });
  }
});

module.exports = validateToken;
