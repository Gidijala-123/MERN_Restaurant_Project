import mongoose from "mongoose";

const EmployeeSchema = mongoose.Schema({
  uname: { type: String, required: [true, "Enter your name"] },
  uemail: { type: String, required: [true, "Enter your mail"], unique: true },
  upassword: { type: String, required: [true, "Enter your password"] },
  avatar: { type: String, default: "" },
  role: { type: String, enum: ["user", "admin"], default: "user" },

  // Favorites — array of item IDs (string)
  favorites: { type: [String], default: [] },

  // Cart — persisted per user
  cart: {
    type: [
      {
        itemId: { type: String, required: true },
        title: { type: String, default: "" },
        price: { type: Number, default: 0 },
        img: { type: String, default: "" },
        cartQuantity: { type: Number, default: 1 },
      }
    ],
    default: [],
  },

  // Profile settings
  profile: {
    phone: { type: String, default: "" },
    address: { type: String, default: "" },
    deliveryInstructions: { type: String, default: "" },
    paymentMethod: { type: String, default: "Cash" },
    foodType: { type: String, default: "veg" },
    deliverySpeed: { type: String, default: "Standard" },
    savedAddresses: { type: Array, default: [] },
    dietaryRestrictions: { type: [String], default: [] },
    referralCode: { type: String, default: "FLAVORA2024" },
  },
}, { timestamps: true });

const EmployeeModel =
  mongoose.models.signupLogin_coll ||
  mongoose.model("signupLogin_coll", EmployeeSchema);
export default EmployeeModel;
