import mongoose from "mongoose";

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
    unique: true,
  },
  upassword: {
    type: String,
    required: [true, "Enter your password"],
  },
  avatar: {
    type: String,
    default: "",
  },
  bookmarks: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "products_coll",
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
}, { timestamps: true });

const EmployeeModel =
  mongoose.models.signupLogin_coll ||
  mongoose.model("signupLogin_coll", EmployeeSchema);
export default EmployeeModel;
