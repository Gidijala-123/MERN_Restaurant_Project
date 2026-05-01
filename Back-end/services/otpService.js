// ── Email via Brevo (HTTP/443) — no SMTP, sends to any address ────────────
// Free tier: 300 emails/day, no domain verification needed
// Sign up: https://app.brevo.com → API Keys → Create key
async function sendViaBrevo({ to, subject, html }) {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) return null;

  const fromEmail = process.env.BREVO_FROM_EMAIL || process.env.EMAIL_FROM || "browserlogins@gmail.com";
  const fromName = process.env.BREVO_FROM_NAME || "Flavora";

  console.log(`[Brevo] Attempting send from: ${fromEmail}`);

   const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: JSON.stringify({
      sender: { name: fromName, email: fromEmail },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Brevo send failed");
  return data;
}

// ── SMS via Fast2SMS or Twilio ─────────────────────────────────────────────
export async function sendSmsOtp({ to, code }) {
  const message = `Your Flavora verification code is: ${code}. Valid for 5 minutes. Do not share this code.`;

  if (process.env.FAST2SMS_API_KEY) {
    try {
      const response = await fetch("https://www.fast2sms.com/dev/bulkV2", {
        method: "POST",
        headers: { authorization: process.env.FAST2SMS_API_KEY, "Content-Type": "application/json" },
        body: JSON.stringify({
          route: "q", message, language: "english", flash: 0,
          numbers: to.replace(/^\+91/, "").replace(/\D/g, ""),
        }),
      });
      const data = await response.json();
      if (data.return === true) return { ok: true, provider: "fast2sms" };
      throw new Error(data.message || "Fast2SMS failed");
    } catch (err) {
      console.error("[Fast2SMS Error]", err.message);
    }
  }

  if (process.env.TWILIO_ACCOUNT_SID) {
    try {
      const { default: twilio } = await import("twilio");
      const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      const response = await client.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: to.startsWith("+") ? to : `+${to}`,
      });
      return { ok: true, provider: "twilio", messageSid: response.sid };
    } catch (err) {
      console.error("[Twilio SMS Error]", err.message);
    }
  }

  console.log(`[SMS Mock] To ${to}: ${code}`);
  return { ok: true, provider: "mock" };
}

// ── WhatsApp via WaBlas or Twilio ──────────────────────────────────────────
export async function sendWhatsAppOtp({ to, code }) {
  const message = `🍽️ *Flavora* — Your verification code is: *${code}*\n\nValid for 5 minutes. Do not share this code.`;

  if (process.env.WABLAS_TOKEN && process.env.WABLAS_DOMAIN) {
    try {
      const phone = to.replace(/^\+/, "").replace(/\D/g, "");
      const response = await fetch(`https://${process.env.WABLAS_DOMAIN}/api/send-message`, {
        method: "POST",
        headers: { Authorization: process.env.WABLAS_TOKEN, "Content-Type": "application/json" },
        body: JSON.stringify({ phone, message }),
      });
      const data = await response.json();
      if (data.status) return { ok: true, provider: "wablas" };
      throw new Error(data.message || "WaBlas failed");
    } catch (err) {
      console.error("[WaBlas Error]", err.message);
    }
  }

  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_WHATSAPP_FROM) {
    try {
      const { default: twilio } = await import("twilio");
      const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      const response = await client.messages.create({
        body: message,
        from: `whatsapp:${process.env.TWILIO_WHATSAPP_FROM}`,
        to: `whatsapp:${to.startsWith("+") ? to : "+" + to}`,
      });
      return { ok: true, provider: "twilio", messageSid: response.sid };
    } catch (err) {
      console.error("[Twilio WhatsApp Error]", err.message);
    }
  }

  console.log(`[WhatsApp Mock] To ${to}: ${code}`);
  return { ok: true, provider: "mock" };
}

import { sendMail as sendGmail } from "./mailer.js";

// ── Email via Gmail SMTP (primary) with Brevo fallback ────────────────────
export async function sendEmailOtp({ to, code = "", subject: customSubject, html: customHtml }) {
  const subject = customSubject || "Your Flavora Verification Code";
  const html = customHtml || buildOtpHtml(code);

  // Try Gmail first (usually more reliable for personal use if App Password is set)
  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    console.log(`[OTP] Attempting Gmail send to: ${to}`);
    try {
      const result = await sendGmail({ to, subject, html });
      if (result) {
        console.log(`[Gmail] Sent to ${to}, messageId: ${result.messageId}`);
        return { ok: true, provider: "gmail", messageId: result.messageId };
      }
    } catch (err) {
      console.error("[Gmail Error]", err.message);
    }
  } else {
    console.log("[OTP] Skipping Gmail (env vars missing)");
  }

  // Fallback to Brevo HTTP API
  try {
    const result = await sendViaBrevo({ to, subject, html });
    if (result) {
      console.log(`[Brevo] Sent to ${to}, messageId: ${result.messageId}`);
      return { ok: true, provider: "brevo", messageId: result.messageId };
    }
  } catch (err) {
    console.error("[Brevo Error]", err.message);
  }

  // Final mock fallback for local dev
  console.log(`[Email Mock] To ${to}: ${code}`);
  return { ok: true, provider: "mock" };
}

// ── OTP email HTML template ────────────────────────────────────────────────
function buildOtpHtml(code) {
  const digits = String(code).split("").map((d) => `
    <td style="padding:0 5px;">
      <div style="width:45px;height:55px;line-height:55px;background:#fff;border-radius:8px;
                  text-align:center;font-size:24px;font-weight:700;color:#ff6600;border:1px solid #eee;">
        ${d}
      </div>
    </td>`).join("");

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"/></head>
  <body style="margin:0;padding:0;font-family:Arial,sans-serif;background:#f4f4f4;">
    <table width="100%" cellpadding="0" cellspacing="0"><tr><td style="padding:20px 0;">
      <table align="center" width="500" cellpadding="0" cellspacing="0"
             style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 10px rgba(0,0,0,.05);">
        <tr><td align="center" style="background:linear-gradient(135deg,#ff6600,#ff8533);padding:40px 0;">
          <h1 style="margin:0;color:#fff;font-size:24px;font-weight:700;">Flavora</h1>
        </td></tr>
        <tr><td style="padding:40px 30px;">
          <p style="font-size:18px;font-weight:600;margin:0 0 12px;">Verification Code</p>
          <p style="font-size:15px;color:#666;margin:0 0 24px;">
            Use the code below to complete your signup. Valid for 5 minutes.
          </p>
          <table align="center" cellpadding="0" cellspacing="0">
            <tr><td align="center" style="background:#fff5eb;padding:24px;border-radius:12px;">
              <table cellpadding="0" cellspacing="0"><tr>${digits}</tr></table>
              <p style="margin:16px 0 0;font-size:13px;color:#ff6600;font-weight:600;letter-spacing:1px;">
                VALID FOR 5 MINUTES
              </p>
            </td></tr>
          </table>
          <p style="margin:24px 0 0;font-size:13px;color:#999;text-align:center;">
            If you didn't request this, you can safely ignore this email.
          </p>
        </td></tr>
        <tr><td style="background:#fafafa;padding:20px;text-align:center;border-top:1px solid #eee;">
          <p style="margin:0;font-size:12px;color:#999;">
            &copy; ${new Date().getFullYear()} Flavora. All rights reserved.
          </p>
        </td></tr>
      </table>
    </td></tr></table>
  </body></html>`;
}
