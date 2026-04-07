import Subscriber from "../models/SubscriberModel.js";
import Order from "../models/OrderModel.js";
import { sendEmailOtp as sendEmail } from "./otpService.js";
import products from "../controllers/products.js";

// ── Helpers ────────────────────────────────────────────────────────────────

function pickRandomItems(count = 3) {
  if (!products?.length) return [];
  const copy = [...products];
  const picked = [];
  while (picked.length < count && copy.length) {
    const idx = Math.floor(Math.random() * copy.length);
    picked.push(copy.splice(idx, 1)[0]);
  }
  return picked;
}

async function recentOrderItems(email, count = 3) {
  if (!email) return [];
  const lastOrder = await Order.findOne({ userEmail: email }).sort({ createdAt: -1 }).lean();
  if (!lastOrder?.items?.length) return [];
  return lastOrder.items.slice(0, count).map((it) => ({
    name: it.title || "Item",
    price: it.price || "",
    image: it.image || "/banner-images/banner0.jpg",
    oldPrice: "",
  }));
}

// ── Newsletter HTML builder ────────────────────────────────────────────────

function buildNewsletterHtml(items = []) {
  const rows = items.map((it) => `
    <tr>
      <td style="padding:10px;border:1px solid #eee;vertical-align:top;">
        <img src="${it.image}" width="100" style="display:block;border-radius:8px;" />
      </td>
      <td style="padding:10px;border:1px solid #eee;font-family:Arial,sans-serif;color:#333;">
        <strong style="font-size:16px;color:#ff6600;">${it.name}</strong><br/>
        <span style="font-size:14px;">₹${it.price}</span>
        ${it.oldPrice ? `<span style="text-decoration:line-through;color:#999;margin-left:8px;">₹${it.oldPrice}</span>` : ""}
      </td>
    </tr>`).join("");

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Flavora Newsletter</title></head>
  <body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0"><tr><td style="padding:20px 0;">
      <table align="center" width="600" cellpadding="0" cellspacing="0"
             style="background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 4px 10px rgba(0,0,0,.05);">
        <tr><td style="background:linear-gradient(135deg,#ff6600,#ff8533);padding:20px;text-align:center;">
          <h1 style="margin:0;color:#fff;font-size:24px;font-weight:700;">🍽️ Flavora</h1>
          <p style="margin:4px 0 0;color:rgba(255,255,255,.85);font-size:14px;">Your fresh &amp; healthy food partner</p>
        </td></tr>
        <tr><td style="padding:24px;">
          <h2 style="margin:0 0 12px;font-size:18px;color:#333;">Special Offers Just for You!</h2>
          <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">${rows}</table>
          <p style="margin:20px 0 0;text-align:center;">
            <a href="https://gbr-kitchen.onrender.com/home"
               style="display:inline-block;background:#ff6600;color:#fff;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:700;">
              Order Now →
            </a>
          </p>
        </td></tr>
        <tr><td style="background:#222;color:#aaa;text-align:center;padding:16px;font-size:12px;">
          You're receiving this because you subscribed to Flavora Newsletter.<br/>
          &copy; ${new Date().getFullYear()} Flavora. All rights reserved.
        </td></tr>
      </table>
    </td></tr></table>
  </body></html>`;
}

// ── Welcome email HTML ─────────────────────────────────────────────────────

function buildWelcomeHtml() {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Welcome to Flavora</title></head>
  <body style="margin:0;padding:0;background:#f5f0e8;font-family:'Segoe UI',Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0"><tr><td style="padding:24px 0;" align="center">
      <table width="600" cellpadding="0" cellspacing="0"
             style="max-width:600px;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.10);">
        <tr><td style="background:linear-gradient(135deg,#ea580c,#fb923c);padding:40px 32px 32px;text-align:center;">
          <h1 style="margin:0 0 8px;font-size:38px;font-weight:900;color:#fff;">🍽️ Flavora</h1>
          <p style="margin:0;font-size:15px;color:rgba(255,255,255,.9);font-style:italic;">Your daily dose of delicious, delivered.</p>
          <div style="margin-top:28px;line-height:0;">
            <svg viewBox="0 0 600 40" xmlns="http://www.w3.org/2000/svg" style="display:block;width:100%;">
              <path d="M0,20 C150,40 450,0 600,20 L600,40 L0,40 Z" fill="#ffffff"/>
            </svg>
          </div>
        </td></tr>
        <tr><td style="padding:36px 40px 24px;">
          <h2 style="margin:0 0 14px;font-size:24px;font-weight:800;color:#ea580c;">Welcome to the Flavora Family! 🎉</h2>
          <p style="margin:0 0 12px;font-size:15px;color:#555;line-height:1.8;">Thank you for subscribing! Expect <strong style="color:#ea580c;">exclusive deals</strong>, fresh recipes, chef picks, and early access to new menu items.</p>
        </td></tr>
        <tr><td style="padding:0 40px 24px;">
          <table width="100%" cellpadding="0" cellspacing="0"
                 style="background:linear-gradient(135deg,#ea580c,#fb923c);border-radius:14px;">
            <tr><td style="padding:28px 24px;text-align:center;">
              <h3 style="margin:0 0 8px;font-size:22px;font-weight:900;color:#fff;">🎁 Welcome Gift — 15% Off!</h3>
              <p style="margin:0 0 20px;font-size:14px;color:rgba(255,255,255,.92);">
                Use code <strong style="background:rgba(255,255,255,.25);padding:2px 10px;border-radius:6px;">FLAVORA15</strong> on your first order
              </p>
              <a href="https://gbr-kitchen.onrender.com/home"
                 style="display:inline-block;background:#fff;color:#ea580c;padding:13px 36px;border-radius:30px;text-decoration:none;font-weight:800;font-size:14px;">
                Order Now →
              </a>
            </td></tr>
          </table>
        </td></tr>
        <tr><td style="background:#1c1917;padding:24px 40px;text-align:center;border-radius:0 0 16px 16px;">
          <p style="margin:0 0 6px;font-size:12px;color:#78716c;">&copy; ${new Date().getFullYear()} Flavora. All rights reserved.</p>
          <p style="margin:0;font-size:11px;color:#57534e;">You're receiving this because you subscribed to Flavora Newsletter.</p>
        </td></tr>
      </table>
    </td></tr></table>
  </body></html>`;
}

// ── Public API ─────────────────────────────────────────────────────────────

export async function subscribeEmail(email) {
  if (!email) throw new Error("Email required");

  let subscriber = await Subscriber.findOne({ email });
  if (!subscriber) {
    subscriber = await new Subscriber({ email }).save();
  }

  // Send welcome email via Resend (fire-and-forget)
  sendEmail({
    to: email,
    code: "",
    subject: "🎉 Welcome to Flavora — Exclusive Offers Inside!",
    html: buildWelcomeHtml(),
  }).catch((err) => console.error("[Newsletter] Welcome email failed:", err.message));

  return subscriber;
}

export async function sendToAll() {
  const subs = await Subscriber.find();
  for (const s of subs) {
    let items = [];
    try { items = await recentOrderItems(s.email, 3); } catch { items = []; }
    if (!items.length) items = pickRandomItems(3);

    const html = buildNewsletterHtml(items);
    try {
      await sendEmail({ to: s.email, code: "", subject: "Your Flavora Offers This Week", html });
      s.lastSentAt = new Date();
      await s.save();
      console.log("[Newsletter] Sent to", s.email);
    } catch (err) {
      console.error("[Newsletter] Failed for", s.email, err.message);
    }
  }
}
