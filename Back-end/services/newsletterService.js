import Subscriber from "../models/SubscriberModel.js";
import Order from "../models/OrderModel.js";
import { sendMail } from "./mailer.js";
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

// ── Welcome email HTML ─────────────────────────────────────────────────────

function buildWelcomeHtml() {
  const year = new Date().getFullYear();
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Welcome to Flavora</title>
</head>
<body style="margin:0;padding:0;background:#fdf6ee;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#fdf6ee;">
<tr><td align="center" style="padding:32px 16px;">
  <table width="600" cellpadding="0" cellspacing="0"
         style="max-width:600px;width:100%;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 8px 40px rgba(234,88,12,.12);">

    <!-- HERO HEADER -->
    <tr><td style="background:linear-gradient(135deg,#c2410c 0%,#ea580c 50%,#fb923c 100%);padding:0;text-align:center;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="padding:44px 32px 16px;text-align:center;">
          <p style="margin:0 0 10px;font-size:52px;line-height:1;">🍽️</p>
          <h1 style="margin:0 0 8px;font-size:44px;font-weight:900;color:#fff;letter-spacing:-1px;">Flavora</h1>
          <p style="margin:0;font-size:15px;color:rgba(255,255,255,.88);font-style:italic;">Fresh &amp; Healthy Food, Delivered with Love</p>
        </td></tr>
        <tr><td style="line-height:0;font-size:0;padding:0;">
          <svg viewBox="0 0 600 50" xmlns="http://www.w3.org/2000/svg" style="display:block;width:100%;">
            <path d="M0,30 C100,55 200,5 300,30 C400,55 500,5 600,30 L600,50 L0,50 Z" fill="#ffffff"/>
          </svg>
        </td></tr>
      </table>
    </td></tr>

    <!-- WELCOME MESSAGE -->
    <tr><td style="padding:36px 44px 24px;">
      <h2 style="margin:0 0 14px;font-size:26px;font-weight:900;color:#1c1917;">Hey there, welcome to the family! 🎉</h2>
      <p style="margin:0 0 14px;font-size:15px;color:#57534e;line-height:1.85;">
        You just made a great decision. As a <strong style="color:#ea580c;">Flavora subscriber</strong>, you'll be the
        first to know about exclusive deals, seasonal specials, new dishes hot off the kitchen, and chef-curated picks —
        all delivered straight to your inbox.
      </p>
      <p style="margin:0;font-size:15px;color:#57534e;line-height:1.85;">
        We're not just a food app — we're your personal food companion. Let's make every meal memorable. 🌟
      </p>
    </td></tr>

    <!-- WELCOME COUPON -->
    <tr><td style="padding:0 44px 32px;">
      <table width="100%" cellpadding="0" cellspacing="0"
             style="background:linear-gradient(135deg,#ea580c,#fb923c);border-radius:16px;">
        <tr><td style="padding:32px 28px;text-align:center;">
          <p style="margin:0 0 4px;font-size:12px;font-weight:700;color:rgba(255,255,255,.8);text-transform:uppercase;letter-spacing:2px;">Your Welcome Gift</p>
          <h3 style="margin:0 0 6px;font-size:34px;font-weight:900;color:#fff;">🎁 15% OFF</h3>
          <p style="margin:0 0 18px;font-size:14px;color:rgba(255,255,255,.9);">on your very first order — no minimum required</p>
          <table align="center" cellpadding="0" cellspacing="0" style="margin-bottom:22px;">
            <tr><td style="background:rgba(255,255,255,.2);border:2px dashed rgba(255,255,255,.7);border-radius:10px;padding:10px 28px;">
              <span style="font-size:24px;font-weight:900;color:#fff;letter-spacing:5px;">FLAVORA15</span>
            </td></tr>
          </table>
          <a href="https://gbr-kitchen.onrender.com/home"
             style="display:inline-block;background:#fff;color:#ea580c;padding:14px 40px;border-radius:50px;text-decoration:none;font-weight:900;font-size:15px;">
            Claim My Discount →
          </a>
        </td></tr>
      </table>
    </td></tr>

    <!-- WHAT YOU GET -->
    <tr><td style="padding:0 44px 28px;">
      <h3 style="margin:0 0 18px;font-size:18px;font-weight:800;color:#1c1917;">What to expect as a subscriber 👇</h3>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td width="50%" style="padding:0 8px 12px 0;vertical-align:top;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff7ed;border-radius:12px;">
              <tr><td style="padding:18px 16px;">
                <p style="margin:0 0 6px;font-size:26px;">🔥</p>
                <strong style="font-size:14px;color:#1c1917;display:block;margin-bottom:4px;">Hot Deals First</strong>
                <span style="font-size:13px;color:#78716c;line-height:1.5;">Flash sales and limited-time offers before anyone else.</span>
              </td></tr>
            </table>
          </td>
          <td width="50%" style="padding:0 0 12px 8px;vertical-align:top;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff7ed;border-radius:12px;">
              <tr><td style="padding:18px 16px;">
                <p style="margin:0 0 6px;font-size:26px;">👨‍🍳</p>
                <strong style="font-size:14px;color:#1c1917;display:block;margin-bottom:4px;">Chef's Weekly Picks</strong>
                <span style="font-size:13px;color:#78716c;line-height:1.5;">Seasonal, fresh, and irresistible dishes every week.</span>
              </td></tr>
            </table>
          </td>
        </tr>
        <tr>
          <td width="50%" style="padding:0 8px 0 0;vertical-align:top;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff7ed;border-radius:12px;">
              <tr><td style="padding:18px 16px;">
                <p style="margin:0 0 6px;font-size:26px;">🆕</p>
                <strong style="font-size:14px;color:#1c1917;display:block;margin-bottom:4px;">New Menu Alerts</strong>
                <span style="font-size:13px;color:#78716c;line-height:1.5;">Be the first to try new additions before they go public.</span>
              </td></tr>
            </table>
          </td>
          <td width="50%" style="padding:0 0 0 8px;vertical-align:top;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff7ed;border-radius:12px;">
              <tr><td style="padding:18px 16px;">
                <p style="margin:0 0 6px;font-size:26px;">🎂</p>
                <strong style="font-size:14px;color:#1c1917;display:block;margin-bottom:4px;">Birthday Surprises</strong>
                <span style="font-size:13px;color:#78716c;line-height:1.5;">Special treats and bonus discounts on your special day.</span>
              </td></tr>
            </table>
          </td>
        </tr>
      </table>
    </td></tr>

    <!-- FEATURED CATEGORIES -->
    <tr><td style="padding:0 44px 32px;">
      <h3 style="margin:0 0 16px;font-size:18px;font-weight:800;color:#1c1917;">Explore our most-loved categories 🍴</h3>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td align="center" style="padding:0 5px 0 0;">
            <a href="https://gbr-kitchen.onrender.com/home" style="text-decoration:none;display:block;">
              <div style="background:#fef3c7;border-radius:12px;padding:14px 6px;text-align:center;">
                <p style="margin:0 0 4px;font-size:24px;">🍛</p>
                <p style="margin:0;font-size:11px;font-weight:700;color:#92400e;">Main Course</p>
              </div>
            </a>
          </td>
          <td align="center" style="padding:0 5px;">
            <a href="https://gbr-kitchen.onrender.com/home" style="text-decoration:none;display:block;">
              <div style="background:#fce7f3;border-radius:12px;padding:14px 6px;text-align:center;">
                <p style="margin:0 0 4px;font-size:24px;">🍗</p>
                <p style="margin:0;font-size:11px;font-weight:700;color:#9d174d;">Starters</p>
              </div>
            </a>
          </td>
          <td align="center" style="padding:0 5px;">
            <a href="https://gbr-kitchen.onrender.com/home" style="text-decoration:none;display:block;">
              <div style="background:#d1fae5;border-radius:12px;padding:14px 6px;text-align:center;">
                <p style="margin:0 0 4px;font-size:24px;">🥗</p>
                <p style="margin:0;font-size:11px;font-weight:700;color:#065f46;">Salads</p>
              </div>
            </a>
          </td>
          <td align="center" style="padding:0 5px;">
            <a href="https://gbr-kitchen.onrender.com/home" style="text-decoration:none;display:block;">
              <div style="background:#ede9fe;border-radius:12px;padding:14px 6px;text-align:center;">
                <p style="margin:0 0 4px;font-size:24px;">🍚</p>
                <p style="margin:0;font-size:11px;font-weight:700;color:#4c1d95;">Biryanis</p>
              </div>
            </a>
          </td>
          <td align="center" style="padding:0 0 0 5px;">
            <a href="https://gbr-kitchen.onrender.com/home" style="text-decoration:none;display:block;">
              <div style="background:#fee2e2;border-radius:12px;padding:14px 6px;text-align:center;">
                <p style="margin:0 0 4px;font-size:24px;">🍮</p>
                <p style="margin:0;font-size:11px;font-weight:700;color:#991b1b;">Desserts</p>
              </div>
            </a>
          </td>
        </tr>
      </table>
    </td></tr>

    <!-- MAIN CTA -->
    <tr><td style="padding:0 44px 36px;text-align:center;">
      <a href="https://gbr-kitchen.onrender.com/home"
         style="display:inline-block;background:linear-gradient(135deg,#ea580c,#fb923c);color:#fff;padding:16px 48px;border-radius:50px;text-decoration:none;font-weight:900;font-size:16px;">
        🍽️ Explore the Full Menu
      </a>
      <p style="margin:16px 0 0;font-size:13px;color:#a8a29e;">
        Questions? Reach us at
        <a href="mailto:contact@flavora.com" style="color:#ea580c;text-decoration:none;font-weight:600;">contact@flavora.com</a>
      </p>
    </td></tr>

    <!-- SOCIAL -->
    <tr><td style="background:#fff7ed;padding:22px 44px;text-align:center;border-top:1px solid #fed7aa;">
      <p style="margin:0 0 12px;font-size:12px;font-weight:700;color:#78716c;text-transform:uppercase;letter-spacing:1px;">Follow us for daily food inspiration</p>
      <table cellpadding="0" cellspacing="0" align="center">
        <tr>
          <td style="padding:0 6px;">
            <a href="#" style="display:inline-block;background:#1877f2;border-radius:50%;width:36px;height:36px;line-height:36px;text-align:center;text-decoration:none;color:#fff;font-weight:900;font-size:14px;">f</a>
          </td>
          <td style="padding:0 6px;">
            <a href="#" style="display:inline-block;background:#e1306c;border-radius:50%;width:36px;height:36px;line-height:36px;text-align:center;text-decoration:none;color:#fff;font-size:16px;">📷</a>
          </td>
          <td style="padding:0 6px;">
            <a href="#" style="display:inline-block;background:#25d366;border-radius:50%;width:36px;height:36px;line-height:36px;text-align:center;text-decoration:none;color:#fff;font-size:16px;">💬</a>
          </td>
          <td style="padding:0 6px;">
            <a href="#" style="display:inline-block;background:#0077b5;border-radius:50%;width:36px;height:36px;line-height:36px;text-align:center;text-decoration:none;color:#fff;font-weight:900;font-size:12px;">in</a>
          </td>
        </tr>
      </table>
    </td></tr>

    <!-- FOOTER -->
    <tr><td style="background:#1c1917;padding:24px 44px;text-align:center;">
      <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:#ea580c;">🍽️ Flavora — Fresh &amp; Healthy Food</p>
      <p style="margin:0 0 10px;font-size:12px;color:#78716c;">7-7-9, Kakinada, Andhra Pradesh, India</p>
      <p style="margin:0;font-size:11px;color:#44403c;line-height:1.7;">
        You received this because you subscribed to Flavora Newsletter.<br/>
        &copy; ${year} Flavora. All rights reserved.
      </p>
    </td></tr>

  </table>
</td></tr>
</table>
</body>
</html>`;
}

// ── Broadcast newsletter HTML ──────────────────────────────────────────────

function buildNewsletterHtml(items = []) {
  const year = new Date().getFullYear();
  const rows = items.map((it) => `
    <tr>
      <td style="padding:12px;border-bottom:1px solid #fef3c7;vertical-align:middle;width:90px;">
        <img src="${it.image}" width="80" height="80"
             style="display:block;border-radius:10px;object-fit:cover;" />
      </td>
      <td style="padding:12px;border-bottom:1px solid #fef3c7;vertical-align:middle;">
        <strong style="font-size:15px;color:#1c1917;display:block;margin-bottom:4px;">${it.name}</strong>
        <span style="font-size:15px;font-weight:800;color:#ea580c;">&#8377;${it.price}</span>
        ${it.oldPrice ? `<span style="text-decoration:line-through;color:#a8a29e;margin-left:8px;font-size:13px;">&#8377;${it.oldPrice}</span>` : ""}
      </td>
      <td style="padding:12px;border-bottom:1px solid #fef3c7;vertical-align:middle;text-align:right;">
        <a href="https://gbr-kitchen.onrender.com/home"
           style="display:inline-block;background:linear-gradient(135deg,#ea580c,#fb923c);color:#fff;padding:8px 18px;border-radius:20px;text-decoration:none;font-weight:700;font-size:13px;">
          Order
        </a>
      </td>
    </tr>`).join("");

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Flavora Weekly Offers</title></head>
  <body style="margin:0;padding:0;background:#fdf6ee;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#fdf6ee;">
  <tr><td align="center" style="padding:24px 16px;">
    <table width="600" cellpadding="0" cellspacing="0"
           style="max-width:600px;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 8px 40px rgba(234,88,12,.10);">
      <tr><td style="background:linear-gradient(135deg,#c2410c,#ea580c,#fb923c);padding:32px;text-align:center;">
        <p style="margin:0 0 6px;font-size:36px;">🍽️</p>
        <h1 style="margin:0 0 4px;font-size:32px;font-weight:900;color:#fff;">Flavora</h1>
        <p style="margin:0;font-size:14px;color:rgba(255,255,255,.85);font-style:italic;">Your weekly dose of delicious deals</p>
      </td></tr>
      <tr><td style="padding:32px 40px 24px;">
        <h2 style="margin:0 0 6px;font-size:22px;font-weight:900;color:#1c1917;">This Week's Special Picks 🔥</h2>
        <p style="margin:0 0 20px;font-size:14px;color:#78716c;">Handpicked by our chefs just for you — order before they sell out!</p>
        <table width="100%" cellpadding="0" cellspacing="0"
               style="border-radius:12px;overflow:hidden;border:1px solid #fef3c7;">${rows}</table>
      </td></tr>
      <tr><td style="padding:0 40px 32px;text-align:center;">
        <a href="https://gbr-kitchen.onrender.com/home"
           style="display:inline-block;background:linear-gradient(135deg,#ea580c,#fb923c);color:#fff;padding:15px 44px;border-radius:50px;text-decoration:none;font-weight:900;font-size:15px;">
          View Full Menu →
        </a>
      </td></tr>
      <tr><td style="background:#1c1917;padding:20px 40px;text-align:center;">
        <p style="margin:0 0 4px;font-size:12px;color:#78716c;">&copy; ${year} Flavora. All rights reserved.</p>
        <p style="margin:0;font-size:11px;color:#44403c;">You're receiving this because you subscribed to Flavora Newsletter.</p>
      </td></tr>
    </table>
  </td></tr>
  </table>
  </body></html>`;
}

// ── Public API ─────────────────────────────────────────────────────────────

export async function subscribeEmail(email) {
  if (!email) throw new Error("Email required");

  const existing = await Subscriber.findOne({ email });
  if (existing) {
    return { subscriber: existing, alreadySubscribed: true };
  }

  // Send email FIRST — only save to DB if it succeeds.
  // This prevents "already subscribed" ghost records when mail delivery fails.
  await sendMail({
    to: email,
    subject: "🎉 Welcome to Flavora — Your 15% Off Coupon is Inside!",
    html: buildWelcomeHtml(),
  });

  // Mail delivered — now persist the subscriber
  const subscriber = await new Subscriber({ email }).save();
  return { subscriber, alreadySubscribed: false };
}

export async function sendToAll() {
  const subs = await Subscriber.find();
  for (const s of subs) {
    let items = [];
    try { items = await recentOrderItems(s.email, 3); } catch { items = []; }
    if (!items.length) items = pickRandomItems(3);

    try {
      await sendMail({
        to: s.email,
        subject: "🔥 This Week's Flavora Specials — Don't Miss Out!",
        html: buildNewsletterHtml(items),
      });
      s.lastSentAt = new Date();
      await s.save();
      console.log("[Newsletter] Sent to", s.email);
    } catch (err) {
      console.error("[Newsletter] Failed for", s.email, err.message);
    }
  }
}
