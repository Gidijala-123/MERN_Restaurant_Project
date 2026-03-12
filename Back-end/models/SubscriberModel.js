import mongoose from "mongoose";

const SubscriberSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    createdAt: { type: Date, default: Date.now },
    lastSentAt: { type: Date },
  },
  { collection: "newsletter_subscribers" },
);

// export model if not already registered
export default mongoose.models.NewsletterSubscriber ||
  mongoose.model("NewsletterSubscriber", SubscriberSchema);
