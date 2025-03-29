const mongoose = require("mongoose");
require("dotenv").config();
const connectionString = process.env.CONNECTION_STRING;

const dbConnection = async () => {
  try {
    const dbConnect = await mongoose.connect(connectionString);
    console.log("DB Connection Success..!");
    console.log("DB Name :", dbConnect.connection.name);
  } catch {
    console.log("Error connecting to DB");
  }
};

module.exports = dbConnection;
