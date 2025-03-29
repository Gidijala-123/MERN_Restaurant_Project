const express = require("express");
const router = express.Router();
const validateToken = require("../middleware/validateToken");
const {
  registerUser,
  loginUser,
  getCurrentUser,
} = require("../controllers/signupLoginController");

router
  .post("/registerUser", registerUser)
  .post("/loginUser", loginUser)
  .get("/getCurrentUser", validateToken, getCurrentUser);

module.exports = router;
