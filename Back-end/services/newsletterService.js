import Subscriber from "../models/SubscriberModel.js";
import Order from "../models/OrderModel.js";
import { sendEmailOtp } from "./otpService.js";
import products from "../controllers/products.js"; // fallback product list

// helper to pick random items (e.g., N out of products)
function pickRandomItems(count = 3) {
  if (!products || products.length === 0) return [];
  const copy = [...products];
  const picked = [];
  while (picked.length < count && copy.length) {
    const idx = Math.floor(Math.random() * copy.length);
    picked.push(copy.splice(idx, 1)[0]);
  }
  return picked;
}

// returns up to `count` items from the user's most recent order (if any)
async function recentOrderItems(email, count = 3) {
  if (!email) return [];
  const lastOrder = await Order.findOne({ userEmail: email })
    .sort({ createdAt: -1 })
    .lean();
  if (!lastOrder || !lastOrder.items || lastOrder.items.length === 0) return [];
  return lastOrder.items.slice(0, count).map((it) => ({
    name: it.title || "Item",
    price: it.price || "",
    image: it.image || "/banner-images/banner0.jpg",
    oldPrice: "",
  }));
}

// build html for newsletter given item list; styled to match the site theme
function buildHtml(items = []) {
  const rows = items
    .map(
      (it) => `
      <tr>
        <td style="padding:10px; border:1px solid #eee; vertical-align:top;">
          <img src="${it.image}" width="100" style="display:block; border-radius:8px;" />
        </td>
        <td style="padding:10px; border:1px solid #eee; font-family:Arial,Helvetica,sans-serif; color:#333;">
          <strong style="font-size:16px; color:#ff6600;">${it.name}</strong><br />
          <span style="font-size:14px;">₹${it.price}</span>
          ${it.oldPrice ? `<span style=\"text-decoration:line-through; color:#999; margin-left:8px;\">₹${it.oldPrice}</span>` : ""}
        </td>
      </tr>`,
    )
    .join("\n");

  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Tasty Kitchen Newsletter</title>
    <style>
      body { margin:0; padding:0; font-family:Arial,Helvetica,sans-serif; background:#f4f4f4; }
      .wrapper { max-width:600px; margin:20px auto; background:#fff; border-radius:8px; overflow:hidden; }
      .header { background: linear-gradient(135deg,#ff6600 0%,#ff8533 100%); color:#fff; padding:20px; text-align:center; }
      .header h1 { margin:0; font-size:24px; }
      .content { padding:20px; }
      .items-table { width:100%; border-collapse:collapse; }
      .items-table td { vertical-align:middle; }
      .footer { background:#222; color:#aaa; text-align:center; padding:15px; font-size:12px; }
      .button { display:inline-block; background:#ff6600; color:#fff; padding:10px 20px; border-radius:4px; text-decoration:none; }
    </style>
  </head>
  <body>
    <div class="wrapper">
      <div class="header">
        <h1>Tasty Kitchen</h1>
        <p>Your fresh & healthy food partner</p>
      </div>
      <div class="content">
        <h2>Special Offers Just for You!</h2>
        <p>Here are some items you might love:</p>
        <table class="items-table">
          ${rows}
        </table>
        <p style="margin-top:20px;">
          <a href="https://tastykitchen.example.com" class="button">Shop Now</a>
        </p>
      </div>
      <div class="footer">
        You are receiving this email because you subscribed to the Tasty Kitchen newsletter.
        <br/>&copy; 2026 Tasty Kitchen. All rights reserved.
      </div>
    </div>
  </body>
  </html>`;
}

export async function subscribeEmail(email) {
  if (!email) throw new Error("Email required");
  console.log("[newsletterService] subscribeEmail called for:", email);
  let subscriber = await Subscriber.findOne({ email });

  // If subscriber doesn't exist, create new one
  if (!subscriber) {
    console.log("[newsletterService] Creating new subscriber for:", email);
    const doc = new Subscriber({ email });
    subscriber = await doc.save();
    console.log("[newsletterService] Subscriber saved to DB:", subscriber);
  } else {
    console.log(
      "[newsletterService] Email already exists (returning existing):",
      email,
    );
  }

  // Always send welcome email (new or existing subscriber)
  try {
    const welcomeHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Welcome to Tasty Kitchen Newsletter</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background-color: #f5f5f5;
          line-height: 1.6;
          color: #333;
        }
        .email-container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }
        .header {
          position: relative;
          background: url('https://via.placeholder.com/600x250?text=Fresh+Food+Every+Day') center/cover no-repeat;
          padding: 0;
          text-align: center;
          color: #ffffff;
        }
        .header::after {
          content: '';
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.35);
        }
        .header-content {
          position: relative;
          padding: 60px 30px;
        }
        .header-content h1 {
          font-size: 36px;
          font-weight: 900;
          margin-bottom: 10px;
          letter-spacing: -1px;
        }
        .header-content p {
          font-size: 16px;
          opacity: 0.9;
          font-style: italic;
        }
        .divider {
          height: 3px;
          background: linear-gradient(90deg, transparent, #fff, transparent);
          margin-top: 20px;
        }
        .main-content {
          padding: 40px 30px;
        }
        .welcome-section {
          margin-bottom: 35px;
        }
        .welcome-section h2 {
          color: #ff6600;
          font-size: 24px;
          margin-bottom: 15px;
        }
        .welcome-section p {
          color: #555;
          margin-bottom: 10px;
          font-size: 15px;
          line-height: 1.8;
        }
        .features-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          margin: 30px 0;
        }
        .feature-box {
          background: linear-gradient(135deg, #fff9f0 0%, #ffe8d6 100%);
          padding: 20px;
          border-radius: 8px;
          border-left: 4px solid #ff6600;
          text-align: center;
        }
        .feature-icon {
          font-size: 28px;
          margin-bottom: 10px;
        }
        .feature-box h3 {
          color: #ff6600;
          font-size: 14px;
          margin-bottom: 5px;
          font-weight: 600;
        }
        .feature-box p {
          color: #666;
          font-size: 12px;
          line-height: 1.5;
        }
        .offer-section {
          background: linear-gradient(135deg, #ff6600 0%, #ff8533 100%);
          padding: 25px;
          border-radius: 8px;
          margin: 30px 0;
          color: #ffffff;
          text-align: center;
        }
        .offer-section h3 {
          font-size: 20px;
          margin-bottom: 10px;
          font-weight: 700;
        }
        .offer-section p {
          font-size: 14px;
          margin-bottom: 15px;
          opacity: 0.95;
        }
        .discount-badge {
          display: inline-block;
          background: rgba(255, 255, 255, 0.25);
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 15px;
        }
        .cta-button {
          display: inline-block;
          background: #ffffff;
          color: #ff6600;
          padding: 12px 32px;
          border-radius: 25px;
          text-decoration: none;
          font-weight: 700;
          font-size: 14px;
          transition: all 0.3s ease;
          cursor: pointer;
          border: none;
        }
        .cta-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(255, 255, 255, 0.3);
        }
        .categories-section {
          margin: 30px 0;
        }
        .categories-section h3 {
          color: #ff6600;
          font-size: 18px;
          margin-bottom: 20px;
          text-align: center;
          font-weight: 700;
        }
        .categories-flex {
          display: flex;
          justify-content: space-around;
          flex-wrap: wrap;
          gap: 10px;
        }
        .category-tag {
          background: #f0f0f0;
          border: 2px solid #ff6600;
          color: #ff6600;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          text-align: center;
        }
        .footer {
          background: #2a2a2a;
          padding: 30px;
          text-align: center;
          color: #aaa;
          font-size: 12px;
        }
        .footer p {
          margin-bottom: 10px;
        }
        .social-links {
          margin: 15px 0;
        }
        .social-links a {
          display: inline-block;
          width: 30px;
          height: 30px;
          margin: 0 5px;
          background: #ff6600;
          color: #ffffff;
          border-radius: 50%;
          text-align: center;
          line-height: 30px;
          text-decoration: none;
          font-size: 14px;
          font-weight: 700;
        }
        .unsubscribe {
          margin-top: 15px;
          padding-top: 15px;
          border-top: 1px solid #444;
          font-size: 11px;
        }
        .unsubscribe a {
          color: #ff6600;
          text-decoration: none;
        }
        .unsubscribe a:hover {
          text-decoration: underline;
        }
        @media (max-width: 600px) {
          .main-content { padding: 25px 15px; }
          .header { padding: 30px 20px; }
          .header-content h1 { font-size: 24px; }
          .features-grid { grid-template-columns: 1fr; }
          .welcome-section h2 { font-size: 20px; }
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <!-- Header Banner -->
        <div class="header">
          <div class="header-content">
            <h1>🍽️ Welcome to Tasty Kitchen</h1>
            <p>Fresh • Healthy • Delicious Delivered</p>
            <div class="divider"></div>
          </div>
        </div>

        <!-- Main Content -->
        <div class="main-content">
          <!-- Welcome Section -->
          <div class="welcome-section">
            <h2>Welcome to the Tasty Kitchen Family! 🎉</h2>
            <p>Thank you for subscribing to our newsletter! We're thrilled to have you on board.</p>
            <p>Get ready for exclusive offers, fresh recipes, and special promotions delivered straight to your inbox. Whether you're craving fresh food, bakery items, or refreshing beverages, we've got you covered!</p>
          </div>

          <!-- Features Grid -->
          <div class="features-grid">
            <div class="feature-box">
              <div class="feature-icon">⭐</div>
              <h3>Exclusive Deals</h3>
              <p>Subscriber-only discounts & early access to new items</p>
            </div>
            <div class="feature-box">
              <div class="feature-icon">🚚</div>
              <h3>Fast Delivery</h3>
              <p>Fresh meals delivered to your doorstep quickly</p>
            </div>
            <div class="feature-box">
              <div class="feature-icon">👨‍🍳</div>
              <h3>Quality Assured</h3>
              <p>Carefully sourced from the best local restaurants</p>
            </div>
            <div class="feature-box">
              <div class="feature-icon">❤️</div>
              <h3>Customer Love</h3>
              <p>Join thousands of satisfied Tasty Kitchen fans</p>
            </div>
          </div>

          <!-- Categories Section -->
          <div class="categories-section">
            <h3>What We Offer</h3>
            <div class="categories-flex">
              <div class="category-tag">🌾 Fresh Food</div>
              <div class="category-tag">🥐 Bakery</div>
              <div class="category-tag">🥤 Drinks</div>
              <div class="category-tag">📰 Blog</div>
            </div>
          </div>

          <!-- Special Offer -->
          <div class="offer-section">
            <div class="discount-badge">NEWSLETTER EXCLUSIVE</div>
            <h3>Special Welcome Offer! 🎁</h3>
            <p>Enjoy 15% off on your first order as a thank you!</p>
            <a href="http://localhost:3000?ref=newsletter" class="cta-button">Start Shopping Now</a>
          </div>

          <!-- Call to Action -->
          <div style="text-align: center; margin: 30px 0;">
            <p style="color: #666; margin-bottom: 15px; font-size: 14px;">
              Hungry for more? Visit our website to explore all the delicious options available.
            </p>
            <a href="http://localhost:3000" class="cta-button" style="background: #ff6600; color: #ffffff;">
              Browse Our Menu
            </a>
          </div>
        </div>

        <!-- Footer -->
        <div class="footer">
          <p><strong>Connect With Us</strong></p>
          <div class="social-links">
            <a href="https://facebook.com">f</a>
            <a href="https://instagram.com">📷</a>
            <a href="https://twitter.com">𝕏</a>
            <a href="https://linkedin.com">in</a>
          </div>
          <p style="margin-top: 15px;">© 2026 Tasty Kitchen. All rights reserved.</p>
          <p>Fresh • Healthy • Delicious Food Delivered to Your Door</p>
          <div class="unsubscribe">
            <p>You're receiving this email because you subscribed to Tasty Kitchen Newsletter.</p>
            <p><a href="#">Manage Preferences</a> | <a href="#">Unsubscribe</a></p>
          </div>
        </div>
      </div>
    </body>
    </html>`;
    console.log("[newsletterService] Sending welcome email to:", email);
    const emailResult = await sendEmailOtp({
      to: email,
      code: "",
      subject:
        "🎉 Welcome to Tasty Kitchen Newsletter - Exclusive Offers Inside!",
      html: welcomeHtml,
    });
    console.log("[newsletterService] Welcome email result:", emailResult);
  } catch (err) {
    // log but don't fail subscription if mail cannot be sent
    console.error(
      "[newsletterService] Welcome email failed:",
      err.message,
      err,
    );
  }

  return subscriber;
}

export async function sendToAll() {
  const subs = await Subscriber.find();
  for (const s of subs) {
    // try to personalise with recent order items, otherwise random
    let items = [];
    try {
      items = await recentOrderItems(s.email, 3);
    } catch {
      items = [];
    }
    if (items.length === 0) {
      items = pickRandomItems(3);
    }
    const html = buildHtml(items);
    try {
      // reuse sendEmailOtp but bypass OTP specifics by providing subject
      await sendEmailOtp({
        to: s.email,
        code: "",
        subject: "Your Tasty Kitchen Offers",
        html,
      });
      s.lastSentAt = new Date();
      await s.save();
      console.log("newsletter sent to", s.email);
    } catch (err) {
      console.error("failed to send newsletter to", s.email, err.message);
    }
  }
}
