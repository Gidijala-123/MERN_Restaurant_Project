// ── Email via Brevo (HTTP/443) — no SMTP, sends to any address ────────────
// Free tier: 300 emails/day, no domain verification needed
// Sign up: https://app.brevo.com → API Keys → Create key
async function sendViaBrevo({ to, subject, html }) {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) return null;

  const fromEmail = process.env.BREVO_FROM_EMAIL || process.env.GMAIL_USER || "browserlogins@gmail.com";
  const fromName = process.env.BREVO_FROM_NAME || "Flavora Kitchen";

  console.log(`[OTP-System] Attempting Brevo send via: ${fromEmail}`);

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
      headers: {
        "X-Entity-Ref-ID": Date.now().toString(),
        "List-Unsubscribe": `<mailto:${fromEmail}?subject=unsubscribe>`,
        "X-Priority": "1 (Highest)",
        "X-Mailer": "FlavoraKitchen-Custom",
      }
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

// ── Email via Brevo HTTP API (primary) with Gmail fallback ────────────────
export async function sendEmailOtp({ to, code = "", subject: customSubject, html: customHtml }) {
  const subject = customSubject || "Your Flavora Verification Code";
  const html = customHtml || buildOtpHtml(code);

  // Try Brevo first (HTTP is much more reliable on Render than SMTP)
  try {
    const result = await sendViaBrevo({ to, subject, html });
    if (result) {
      console.log(`[Brevo] Sent to ${to}, messageId: ${result.messageId}`);
      return { ok: true, provider: "brevo", messageId: result.messageId };
    }
  } catch (err) {
    console.error("[Brevo Error]", err.message);
  }

  // Fallback to Gmail SMTP
  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    console.log(`[OTP] Attempting Gmail fallback send to: ${to}`);
    try {
      const result = await sendGmail({ to, subject, html });
      if (result) {
        console.log(`[Gmail] Sent to ${to}, messageId: ${result.messageId}`);
        return { ok: true, provider: "gmail", messageId: result.messageId };
      }
    } catch (err) {
      console.error("[Gmail Error]", err.message);
    }
  }

  // Final mock fallback for local dev
  console.log(`\n************************************************`);
  console.log(`[CRITICAL FALLBACK] OTP FOR ${to}: ${code}`);
  console.log(`************************************************\n`);
  return { ok: true, provider: "mock", code }; // Return code in response for easier debugging if needed
}

// ── OTP email HTML template ────────────────────────────────────────────────
function buildOtpHtml(code) {
  const digits = String(code).split("").map((d) => `
    <td style="padding:0 5px;">
      <div style="width:45px;height:55px;line-height:55px;background:#ffffff;border-radius:8px;
                  text-align:center;font-size:24px;font-weight:700;color:#ff6600;border:1px solid #eeeeee;">
        ${d}
      </div>
    </td>`).join("");

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"/></head>
  <body style="margin:0;padding:0;font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;background-color:#f4f4f4;color:#333333;">
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
      <tr>
        <td style="padding:20px 0;" align="center">
          <table width="500" cellpadding="0" cellspacing="0" role="presentation"
                 style="background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 10px rgba(0,0,0,0.05);border:1px solid #dddddd;">
            <tr>
              <td align="center" style="background:linear-gradient(135deg,#ff6600,#ff8533);padding:40px 0;">
                <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;letter-spacing:1px;">Flavora Kitchen</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:40px 30px;">
                <h2 style="font-size:20px;font-weight:600;margin:0 0 16px;color:#222222;">Verify Your Account</h2>
                <p style="font-size:16px;line-height:1.5;color:#555555;margin:0 0 24px;">
                  Hello, thank you for choosing Flavora! Please use the 6-digit verification code below to complete your registration. This code is unique to your request.
                </p>
                <table align="center" cellpadding="0" cellspacing="0" role="presentation">
                  <tr>
                    <td align="center" style="background-color:#fff5eb;padding:30px;border-radius:12px;border:1px dashed #ffcc99;">
                      <table cellpadding="0" cellspacing="0" role="presentation">
                        <tr>${digits}</tr>
                      </table>
                      <p style="margin:20px 0 0;font-size:14px;color:#ff6600;font-weight:700;letter-spacing:2px;text-transform:uppercase;">
                        Expires in 5 Minutes
                      </p>
                    </td>
                  </tr>
                </table>
                <p style="margin:30px 0 0;font-size:14px;line-height:1.4;color:#888888;text-align:center;">
                  If you did not request this code, please ignore this email or contact our support team if you have concerns.
                </p>
              </td>
            </tr>
            <tr>
              <td style="background-color:#fafafa;padding:25px;text-align:center;border-top:1px solid #eeeeee;">
                <p style="margin:0;font-size:12px;color:#aaaaaa;line-height:1.2;">
                  &copy; ${new Date().getFullYear()} Flavora Kitchen. All rights reserved.<br/>
                  123 Gourmet Street, Foodie City, FC 12345
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body></html>`;
}
