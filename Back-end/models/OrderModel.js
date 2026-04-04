import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({
  userEmail: { type: String, lowercase: true },
  paymentId: { type: String, default: "" },
  items: [
    {
      id: String,
      title: String,
      price: Number,
      cartQuantity: { type: Number, default: 1 },
    },
  ],
  subtotal: { type: Number, default: 0 },
  gst: { type: Number, default: 0 },
  grandTotal: { type: Number, default: 0 },
  status: { type: String, enum: ["pending", "preparing", "out_for_delivery", "delivered", "cancelled"], default: "pending" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);
