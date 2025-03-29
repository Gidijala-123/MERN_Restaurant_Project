const mongoose = require("mongoose");
const moment = require("moment");

const EmployeeSchema = mongoose.Schema({
  uname: {
    type: String,
    required: [true, "Enter your name"],
  },
  uemail: {
    type: String,
    required: [true, "Enter your mail"],
  },
  upassword: {
    type: String,
    required: [true, "Enter your password"],
  },
  createdDate: {
    // type: Date,
    // default: Date.now,
    type: String, // Store the date as a string
    default: moment().format("DD-MM-YYYY"), // Format the default date as "05-11-2023"
  },
});

module.exports = mongoose.model("signupLogin_coll", EmployeeSchema);
