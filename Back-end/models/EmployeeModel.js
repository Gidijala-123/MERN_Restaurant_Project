import mongoose from "mongoose";
import moment from "moment";

/**
 * Schema definition for Employee/User model
 * Used for signup, login, and user profile management
 */
const EmployeeSchema = mongoose.Schema({
  uname: {
    type: String,
    required: [true, "Enter your name"],
  },
  uemail: {
    type: String,
    required: [true, "Enter your mail"],
    unique: true, // Ensures email addresses are unique in the collection
  },
  upassword: {
    type: String,
    required: [true, "Enter your password"],
  },
  avatar: {
    type: String,
    default: "", // Data URL or external URL
  },
  createdDate: {
    type: String,
    // Automatically sets current date in DD-MM-YYYY format
    default: () => moment().format("DD-MM-YYYY"),
  },
  bookmarks: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "products_coll", // Assuming your products collection is named 'products_coll'
    },
  ],
  cart: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "products_coll",
      },
      quantity: {
        type: Number,
        default: 1,
      },
    },
  ],
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
});

const EmployeeModel = mongoose.model("signupLogin_coll", EmployeeSchema);
export default EmployeeModel;
