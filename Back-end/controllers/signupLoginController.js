const asyncHandler = require("express-async-handler");
const EmployeeModel = require("../models/EmployeeModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require("dotenv").config();

const registerUser = asyncHandler(async (req, res) => {
  try {
    const { uname, uemail, upassword } = req.body;
    if (!uname || !uemail || !upassword) {
      return res.status(403).json({ Message: "All fields are required" });
    }
    const checkForExisitingUser = await EmployeeModel.findOne({ uemail });
    if (checkForExisitingUser) {
      return res.status(403).json({ Message: "User already exists..!" });
    }
    const hashedPassword = await bcrypt.hash(upassword, 10);
    const newUser = await EmployeeModel.create({
      uname,
      uemail,
      upassword: hashedPassword,
    });
    console.log(`User created ${newUser}`);
    if (newUser) {
      return res.json({
        Message: "User created successfully..!",
        id: newUser.id,
        uemail: newUser.uemail, // Correct field name
      });
    } else {
      return res.status(402).json({ Error: "Invalid credentials" });
    }
  } catch (error) {
    console.error("Error in registerUser:", error);
    return res.status(500).json({ Error: "Internal server error" });
  }
});

const loginUser = asyncHandler(async (req, res) => {
  const { uemail, upassword } = req.body;
  if (!uemail || !upassword) {
    return res.status(403).json({ Message: "All fields are required" });
  }
  const validUser = await EmployeeModel.findOne({ uemail });
  if (validUser && (await bcrypt.compare(upassword, validUser.upassword))) {
    const generateToken = jwt.sign(
      {
        tokenKey: {
          uname: validUser.uname,
          uemail: validUser.uemail,
          uid: validUser.id,
        },
      },
      process.env.ACCESS_TOKEN,
      { expiresIn: "30m" }
    );
    return res.status(200).json({ "Access Token": generateToken });
  } else {
    return res.status(403).json({ Message: "Invalid details" });
  }
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res.json(req.tokenKey);
});

module.exports = { registerUser, loginUser, getCurrentUser };
