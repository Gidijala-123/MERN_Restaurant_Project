import mongoose from "mongoose";

const menuItemSchema = new mongoose.Schema(
  {
    itemId: {
      type: Number,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "Hot Offers",
        "Veg Starters",
        "Non-Veg Starters",
        "Tandooris",
        "Soups",
        "Salads",
        "Sandwiches",
        "Signature Dishes",
        "Biryanis",
        "Main Course",
        "Rice & Breads",
        "South Indian",
        "Chinese/Indo-Chinese",
        "Beverages",
        "Cocktails/Mocktails",
        "Desserts",
      ],
    },
    subCategory: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    rating: {
      type: Number,
      required: true,
      min: 0,
      max: 5,
      default: 4.0,
    },
    reviews: {
      type: Number,
      default: 0,
      min: 0,
    },
    calories: {
      type: Number,
      required: true,
      min: 0,
    },
    serves: {
      type: Number,
      required: true,
      min: 1,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    veg: {
      type: Boolean,
      default: false,
    },
    availability: {
      type: Boolean,
      default: true,
    },
    isHotOffer: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

// Add indexes for performance optimization
menuItemSchema.index({ category: 1 });
menuItemSchema.index({ subCategory: 1 });
menuItemSchema.index({ price: 1 });
menuItemSchema.index({ name: "text" }); // Text index for search

const Menu = mongoose.model("Menu", menuItemSchema);

export default Menu;
