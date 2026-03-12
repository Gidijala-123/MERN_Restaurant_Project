import nodemailer from "nodemailer";

// We define this outside to reuse the connection (Performance Optimization)
let transporter = null;

export async function sendSmsOtp({ to, code }) {
  const provider = process.env.OTP_PROVIDER || "mock";
  const message = `Your GBR Grocery verification code is: ${code}. Valid for 5 minutes. Do not share this code.`;

  if (provider === "twilio" && process.env.TWILIO_ACCOUNT_SID) {
    try {
      const twilio = require("twilio");
      const client = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN,
      );

      const response = await client.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: to.startsWith("+") ? to : `+${to}`,
      });

      console.log(`[Twilio SMS] Sent to ${to}, SID: ${response.sid}`);
      return { ok: true, provider: "twilio", messageSid: response.sid };
    } catch (error) {
      console.error(`[Twilio SMS Error]`, error.message);
      // Fall back to mock if Twilio fails
      console.log(`[SMS Mock Fallback] To ${to}: ${code}`);
      return { ok: true, provider: "mock", error: error.message };
    }
  }

  // Default mock provider for development
  console.log(`[SMS Mock] To ${to}: ${code}`);
  return { ok: true, provider: "mock" };
}

export async function sendWhatsAppOtp({ to, code }) {
  const provider = process.env.OTP_PROVIDER || "mock";
  const message = `Your GBR Grocery verification code is: ${code}. Valid for 5 minutes. Do not share this code.`;

  if (provider === "twilio" && process.env.TWILIO_ACCOUNT_SID) {
    try {
      const twilio = require("twilio");
      const client = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN,
      );

      const response = await client.messages.create({
        body: message,
        from: `whatsapp:${process.env.TWILIO_WHATSAPP_FROM}`,
        to: `whatsapp:${to.startsWith("+") ? to : "+" + to}`,
      });

      console.log(`[Twilio WhatsApp] Sent to ${to}, SID: ${response.sid}`);
      return { ok: true, provider: "twilio", messageSid: response.sid };
    } catch (error) {
      console.error(`[Twilio WhatsApp Error]`, error.message);
      // Fall back to mock if Twilio fails
      console.log(`[WhatsApp Mock Fallback] To ${to}: ${code}`);
      return { ok: true, provider: "mock", error: error.message };
    }
  }

  // Default mock provider for development
  console.log(`[WhatsApp Mock] To ${to}: ${code}`);
  return { ok: true, provider: "mock" };
}

// new email helper
export async function sendEmailOtp({ to, code }) {
  const provider = process.env.OTP_PROVIDER || "mock";
  const subject = "OTP From GBR Grocery";

  // Generate OTP digit boxes HTML
  const otpDigits = String(code)
    .split("")
    .map((digit) => `<div class="otp-digit">${digit}</div>`)
    .join("");

  const html = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>GBR Grocery Verification</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
            background-color: #f8f9fa;
            line-height: 1.6;
            color: #333;
          }
          .wrapper {
            max-width: 500px;
            margin: 20px auto;
            background: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          }
          .header {
            background: linear-gradient(135deg, #ff6600 0%, #ff8533 100%);
            padding: 2rem;
            text-align: center;
            color: #ffffff;
          }
          .logo-container {
            margin-bottom: 1rem;
          }
          .logo {
            display: block;
            width: 80px;
            height: 80px;
            margin: 0 auto 1rem;
            border-radius: 12px;
            background: rgba(255, 255, 255, 0.2);
            object-fit: contain;
            padding: 8px;
          }
          .header h1 {
            font-size: 1.75rem;
            font-weight: 700;
            letter-spacing: -0.5px;
          }
          .content {
            padding: 2rem;
          }
          .greeting {
            font-size: 1rem;
            margin-bottom: 1.5rem;
            color: #333;
          }
          .greeting strong {
            font-weight: 600;
          }
          .instruction {
            font-size: 0.95rem;
            color: #666;
            margin-bottom: 2rem;
            text-align: center;
          }
          .otp-container {
            background: linear-gradient(135deg, #ff6600 0%, #ff8533 100%);
            padding: 2rem;
            border-radius: 12px;
            display: flex;
            justify-content: center;
            gap: 0.5rem;
            margin: 2rem 0;
          }
          .otp-digit {
            width: 50px;
            height: 50px;
            background: #ffffff;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.75rem;
            font-weight: 700;
            color: #ff6600;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            letter-spacing: 2px;
          }
          .cta-section {
            text-align: center;
            margin: 2rem 0;
          }
          .verify-btn {
            display: inline-block;
            background: linear-gradient(135deg, #ff6600 0%, #ff8533 100%);
            color: #ffffff;
            padding: 0.875rem 2rem;
            border-radius: 12px;
            text-decoration: none;
            font-weight: 600;
            font-size: 1rem;
            border: none;
            cursor: pointer;
            box-shadow: 0 4px 15px rgba(255, 102, 0, 0.3);
            transition: all 0.3s ease;
            letter-spacing: 0.5px;
          }
          .verify-btn:hover {
            box-shadow: 0 6px 20px rgba(255, 102, 0, 0.4);
          }
          .footer-note {
            background: #f8f9fa;
            padding: 1.5rem;
            border-radius: 12px;
            font-size: 0.85rem;
            color: #666;
            text-align: center;
            margin-top: 1.5rem;
          }
          .divider {
            height: 1px;
            background: #e9ecef;
            margin: 1.5rem 0;
          }
          .footer {
            background: #f8f9fa;
            padding: 1.5rem;
            text-align: center;
            font-size: 0.8rem;
            color: #999;
            border-top: 1px solid #e9ecef;
          }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <!-- Header -->
          <div class="header">
            <div class="logo-container">
              <img 
                src="https://via.placeholder.com/80x80.png?text=GBR" 
                alt="GBR Grocery" 
                class="logo"
              />
            </div>
            <h1>GBR Grocery</h1>
          </div>

          <!-- Content -->
          <div class="content">
            <p class="greeting">Hi there! 👋</p>
            <p class="instruction">
              Your verification code is ready. Use it to complete your sign-up.
            </p>

            <!-- OTP Digit Boxes -->
            <div class="otp-container">
              ${otpDigits}
            </div>

            <!-- CTA Button -->
            <div class="cta-section">
              <button class="verify-btn">✓ Verify Now</button>
            </div>

            <!-- Important Note -->
            <div class="footer-note">
              <strong>This code expires in 5 minutes.</strong><br />
              If you didn't request this, please ignore this email.
            </div>

            <div class="divider"></div>

            <!-- Additional Info -->
            <p style="font-size: 0.95rem; color: #666; margin: 1rem 0;">
              <strong>Why did you get this email?</strong><br />
              We're verifying your email address to keep your account secure.
            </p>
          </div>

          <!-- Footer -->
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} GBR Grocery Store. All rights reserved.</p>
            <p style="margin-top: 0.5rem;">Need help? Contact us at support@gbrgrocery.com</p>
          </div>
        </div>
      </body>
    </html>
  `;

  // helper that builds a transport config depending on environment variables
  function buildTransportOptions() {
    // if a generic "service" is provided (eg. "gmail") we use it
    if (process.env.SMTP_SERVICE) {
      const opts = { service: process.env.SMTP_SERVICE };
      if (process.env.SMTP_USER && process.env.SMTP_PASS) {
        opts.auth = {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        };
      }
      return opts;
    }

    // otherwise fall back to host/port/secure
    if (process.env.SMTP_HOST) {
      return {
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || "587", 10),
        secure: process.env.SMTP_SECURE === "true",
        auth:
          process.env.SMTP_USER && process.env.SMTP_PASS
            ? {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
              }
            : undefined,
      };
    }

    return null;
  }

  // only attempt real delivery when provider matches and we have transport info
  const transportOpts = buildTransportOptions();
  if ((provider === "smtp" || provider === "gmail") && transportOpts) {
    try {
      // Initialize transporter singleton if it doesn't exist
      if (!transporter) {
        transporter = nodemailer.createTransport(transportOpts);
      }

      const info = await transporter.sendMail({
        from:
          process.env.EMAIL_FROM ||
          process.env.SMTP_USER ||
          "no-reply@example.com",
        to,
        subject,
        html,
      });

      console.log(
        `[Email OTP] Sent to ${to}, provider=${provider}, messageId: ${info.messageId}`,
      );
      return {
        ok: true,
        provider: provider === "gmail" ? "smtp(gmail)" : "smtp",
        messageId: info.messageId,
      };
    } catch (err) {
      console.error("[Email OTP Error]", err.message);
      console.log(`[Email Mock Fallback] To ${to}: ${code}`);
      return { ok: true, provider: "mock", error: err.message };
    }
  }

  if (provider === "smtp" || provider === "gmail") {
    // provider requested but configuration is missing
    console.warn(
      `OTP_PROVIDER=${provider} but no SMTP configuration found; falling back to mock`,
    );
  }

  // default mock behaviour (useful for local development)
  console.log(`[Email Mock] To ${to}: ${code}`);
  return { ok: true, provider: "mock" };
}
