import { Resend } from "resend";
import nodemailer from "nodemailer";

// ── Resend client — HTTP/443, no SMTP port throttling ─────────────────────
let _resend = null;
function getResend() {
  if (_resend) return _resend;
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  _resend = new Resend(key);
  return _resend;
}

// ── Nodemailer transporter — fallback when Resend domain not verified ──────
let _transporter = null;
function getTransporter() {
  if (_transporter) return _transporter;
  if (!process.env.SMTP_SERVICE && !process.env.SMTP_HOST) return null;
  const opts = process.env.SMTP_SERVICE
    ? { service: process.env.SMTP_SERVICE, auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } }
    : { host: process.env.SMTP_HOST, port: parseInt(process.env.SMTP_PORT || "587"), secure: process.env.SMTP_SECURE === "true", auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } };
  _transporter = nodemailer.createTransport(opts);
  return _transporter;
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

// ── Email via Resend (primary) → Gmail SMTP (fallback) ────────────────────
export async function sendEmailOtp({ to, code = "", subject: customSubject, html: customHtml }) {
  const subject = customSubject || "Your Flavora Verification Code";
  const html = customHtml || buildOtpHtml(code);

  // Try Resend first (HTTP/443 — fast, no port throttling)
  const resend = getResend();
  if (resend) {
    try {
      const from = process.env.RESEND_FROM || "Flavora <onboarding@resend.dev>";
      const { data, error } = await resend.emails.send({ from, to, subject, html });
      if (error) throw new Error(error.message);
      console.log(`[Resend] Sent to ${to}, id: ${data?.id}`);
      return { ok: true, provider: "resend", id: data?.id };
    } catch (err) {
      console.error("[Resend Error] Falling back to SMTP:", err.message);
      // fall through to SMTP below
    }
  }

  // Fallback: Gmail SMTP via nodemailer
  const t = getTransporter();
  if (t) {
    try {
      const from = process.env.EMAIL_FROM || process.env.SMTP_USER || "no-reply@flavora.com";
      const info = await t.sendMail({ from, to, subject, html });
      console.log(`[SMTP] Sent to ${to}, messageId: ${info.messageId}`);
      return { ok: true, provider: "smtp", messageId: info.messageId };
    } catch (err) {
      console.error("[SMTP Error]", err.message);
      _transporter = null; // reset so it rebuilds on next attempt
      return { ok: false, provider: "smtp", error: err.message };
    }
  }

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
