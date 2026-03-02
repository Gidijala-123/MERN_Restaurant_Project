import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();
// Get MongoDB connection string from environment variables
const connectionString = process.env.CONNECTION_STRING;

/**
 * Establishes connection to MongoDB database using Mongoose
 */
const dbConnection = async () => {
  try {
    const dbConnect = await mongoose.connect(connectionString);
    console.log("DB Connection Success..!");
    // Log the database name for verification
    console.log("DB Name :", dbConnect.connection.name);
  } catch (error) {
    // Log connection error and message
    console.error("Error connecting to DB:", error.message);
  }
};

export default dbConnection;
