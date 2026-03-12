import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({
  userEmail: { type: String, lowercase: true },
  items: [
    {
      id: String,
      title: String,
      price: Number,
      quantity: { type: Number, default: 1 },
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);
