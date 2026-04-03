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
    const welcomeHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to Flavora Newsletter</title>
</head>
<body style="margin:0;padding:0;background:#f5f0e8;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f5f0e8;padding:24px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.10);">

        <!-- HEADER -->
        <tr>
          <td style="background:linear-gradient(135deg,#ea580c 0%,#fb923c 100%);padding:40px 32px 32px;text-align:center;">
            <p style="margin:0 0 6px;font-size:13px;font-weight:700;letter-spacing:3px;color:rgba(255,255,255,0.8);text-transform:uppercase;">Fresh &amp; Healthy Food</p>
            <h1 style="margin:0 0 8px;font-size:38px;font-weight:900;color:#ffffff;letter-spacing:-1px;">🍽️ Flavora</h1>
            <p style="margin:0;font-size:15px;color:rgba(255,255,255,0.9);font-style:italic;">Your daily dose of delicious, delivered.</p>
            <!-- Decorative wave -->
            <div style="margin-top:28px;line-height:0;">
              <svg viewBox="0 0 600 40" xmlns="http://www.w3.org/2000/svg" style="display:block;width:100%;">
                <path d="M0,20 C150,40 450,0 600,20 L600,40 L0,40 Z" fill="#ffffff"/>
              </svg>
            </div>
          </td>
        </tr>

        <!-- WELCOME TEXT -->
        <tr>
          <td style="padding:36px 40px 24px;">
            <h2 style="margin:0 0 14px;font-size:24px;font-weight:800;color:#ea580c;">Welcome to the Flavora Family! 🎉</h2>
            <p style="margin:0 0 12px;font-size:15px;color:#555;line-height:1.8;">Thank you for subscribing! We're excited to have you with us.</p>
            <p style="margin:0;font-size:15px;color:#555;line-height:1.8;">Expect <strong style="color:#ea580c;">exclusive deals</strong>, fresh recipes, chef picks, and early access to new menu items — delivered straight to your inbox.</p>
          </td>
        </tr>

        <!-- DIVIDER -->
        <tr><td style="padding:0 40px;"><hr style="border:none;border-top:1.5px solid #fde8cc;margin:0;" /></td></tr>

        <!-- FEATURES — 2x2 table grid (email-safe) -->
        <tr>
          <td style="padding:28px 32px 8px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td width="50%" style="padding:8px;">
                  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:linear-gradient(135deg,#fff7ed,#ffedd5);border-radius:12px;border-left:4px solid #ea580c;">
                    <tr><td style="padding:20px;text-align:center;">
                      <div style="font-size:28px;margin-bottom:8px;">⭐</div>
                      <p style="margin:0 0 5px;font-size:13px;font-weight:800;color:#ea580c;text-transform:uppercase;letter-spacing:0.5px;">Exclusive Deals</p>
                      <p style="margin:0;font-size:12px;color:#78716c;line-height:1.5;">Subscriber-only discounts &amp; early access to new items</p>
                    </td></tr>
                  </table>
                </td>
                <td width="50%" style="padding:8px;">
                  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:linear-gradient(135deg,#fff7ed,#ffedd5);border-radius:12px;border-left:4px solid #ea580c;">
                    <tr><td style="padding:20px;text-align:center;">
                      <div style="font-size:28px;margin-bottom:8px;">🚀</div>
                      <p style="margin:0 0 5px;font-size:13px;font-weight:800;color:#ea580c;text-transform:uppercase;letter-spacing:0.5px;">Fast Delivery</p>
                      <p style="margin:0;font-size:12px;color:#78716c;line-height:1.5;">Hot meals at your doorstep in under 30 minutes</p>
                    </td></tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td width="50%" style="padding:8px;">
                  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:linear-gradient(135deg,#fff7ed,#ffedd5);border-radius:12px;border-left:4px solid #ea580c;">
                    <tr><td style="padding:20px;text-align:center;">
                      <div style="font-size:28px;margin-bottom:8px;">👨‍🍳</div>
                      <p style="margin:0 0 5px;font-size:13px;font-weight:800;color:#ea580c;text-transform:uppercase;letter-spacing:0.5px;">Chef Curated</p>
                      <p style="margin:0;font-size:12px;color:#78716c;line-height:1.5;">Recipes crafted by top chefs using fresh local ingredients</p>
                    </td></tr>
                  </table>
                </td>
                <td width="50%" style="padding:8px;">
                  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:linear-gradient(135deg,#fff7ed,#ffedd5);border-radius:12px;border-left:4px solid #ea580c;">
                    <tr><td style="padding:20px;text-align:center;">
                      <div style="font-size:28px;margin-bottom:8px;">❤️</div>
                      <p style="margin:0 0 5px;font-size:13px;font-weight:800;color:#ea580c;text-transform:uppercase;letter-spacing:0.5px;">10K+ Happy Fans</p>
                      <p style="margin:0;font-size:12px;color:#78716c;line-height:1.5;">Join thousands of satisfied Flavora customers</p>
                    </td></tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- WELCOME OFFER BANNER -->
        <tr>
          <td style="padding:24px 40px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:linear-gradient(135deg,#ea580c,#fb923c);border-radius:14px;">
              <tr><td style="padding:28px 24px;text-align:center;">
                <p style="margin:0 0 6px;display:inline-block;background:rgba(255,255,255,0.2);color:#fff;font-size:11px;font-weight:700;letter-spacing:2px;padding:5px 14px;border-radius:20px;text-transform:uppercase;">Newsletter Exclusive</p>
                <h3 style="margin:12px 0 8px;font-size:22px;font-weight:900;color:#ffffff;">🎁 Welcome Gift — 15% Off!</h3>
                <p style="margin:0 0 20px;font-size:14px;color:rgba(255,255,255,0.92);line-height:1.6;">Use code <strong style="background:rgba(255,255,255,0.25);padding:2px 10px;border-radius:6px;letter-spacing:1px;">FLAVORA15</strong> on your first order</p>
                <a href="https://gbr-kitchen.onrender.com/home" style="display:inline-block;background:#ffffff;color:#ea580c;padding:13px 36px;border-radius:30px;text-decoration:none;font-weight:800;font-size:14px;letter-spacing:0.5px;">Order Now →</a>
              </td></tr>
            </table>
          </td>
        </tr>

        <!-- CATEGORIES -->
        <tr>
          <td style="padding:4px 40px 28px;">
            <p style="margin:0 0 16px;font-size:16px;font-weight:800;color:#1c1917;text-align:center;">Explore Our Menu</p>
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td align="center" style="padding:4px;">
                  <table cellpadding="0" cellspacing="4" border="0"><tr>
                    <td style="background:#fff7ed;border:1.5px solid #fed7aa;border-radius:20px;padding:7px 16px;font-size:12px;font-weight:700;color:#ea580c;">🌿 Fresh Food</td>
                    <td style="background:#fff7ed;border:1.5px solid #fed7aa;border-radius:20px;padding:7px 16px;font-size:12px;font-weight:700;color:#ea580c;">🥐 Bakery</td>
                    <td style="background:#fff7ed;border:1.5px solid #fed7aa;border-radius:20px;padding:7px 16px;font-size:12px;font-weight:700;color:#ea580c;">🥤 Beverages</td>
                    <td style="background:#fff7ed;border:1.5px solid #fed7aa;border-radius:20px;padding:7px 16px;font-size:12px;font-weight:700;color:#ea580c;">🍛 Biryanis</td>
                  </tr></table>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td style="background:#1c1917;padding:32px 40px;text-align:center;border-radius:0 0 16px 16px;">
            <p style="margin:0 0 4px;font-size:20px;font-weight:900;color:#ea580c;">🍽️ Flavora</p>
            <p style="margin:0 0 18px;font-size:12px;color:#a8a29e;">Fresh &bull; Healthy &bull; Delicious Food Delivered to Your Door</p>
            <!-- Social -->
            <table cellpadding="0" cellspacing="0" border="0" align="center" style="margin-bottom:20px;">
              <tr>
                <td style="padding:0 5px;"><a href="https://facebook.com" style="display:inline-block;width:32px;height:32px;background:#ea580c;border-radius:50%;text-align:center;line-height:32px;color:#fff;text-decoration:none;font-size:13px;font-weight:700;">f</a></td>
                <td style="padding:0 5px;"><a href="https://instagram.com" style="display:inline-block;width:32px;height:32px;background:#ea580c;border-radius:50%;text-align:center;line-height:32px;color:#fff;text-decoration:none;font-size:13px;">📷</a></td>
                <td style="padding:0 5px;"><a href="https://twitter.com" style="display:inline-block;width:32px;height:32px;background:#ea580c;border-radius:50%;text-align:center;line-height:32px;color:#fff;text-decoration:none;font-size:13px;font-weight:700;">𝕏</a></td>
                <td style="padding:0 5px;"><a href="https://linkedin.com" style="display:inline-block;width:32px;height:32px;background:#ea580c;border-radius:50%;text-align:center;line-height:32px;color:#fff;text-decoration:none;font-size:13px;font-weight:700;">in</a></td>
              </tr>
            </table>
            <p style="margin:0 0 6px;font-size:12px;color:#78716c;">&copy; 2026 Flavora. All rights reserved.</p>
            <p style="margin:0 0 14px;font-size:11px;color:#57534e;">You're receiving this because you subscribed to Flavora Newsletter.</p>
            <p style="margin:0;font-size:11px;"><a href="#" style="color:#ea580c;text-decoration:none;">Manage Preferences</a> &nbsp;|&nbsp; <a href="#" style="color:#ea580c;text-decoration:none;">Unsubscribe</a></p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
    console.log("[newsletterService] Sending welcome email to:", email);
    const emailResult = await sendEmailOtp({
      to: email,
      code: "",
      subject: "🎉 Welcome to Flavora — Exclusive Offers Inside!",
      html: welcomeHtml,
    });
    console.log("[newsletterService] Welcome email result:", emailResult);
  } catch (err) {
    console.error("[newsletterService] Welcome email failed:", err.message, err);
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
