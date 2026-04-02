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

// new email helper - supports both OTP codes and custom HTML (newsletter, etc)
export async function sendEmailOtp({
  to,
  code = "",
  subject: customSubject,
  html: customHtml,
}) {
  const provider = process.env.OTP_PROVIDER || "mock";
  let subject;
  let html;

  // If custom subject and html provided (e.g., for newsletter), use them
  // Otherwise generate OTP template
  if (customSubject && customHtml) {
    console.log("[sendEmailOtp] Using custom subject and HTML template");
    subject = customSubject;
    html = customHtml;
  } else {
    // Generate default OTP template
    console.log("[sendEmailOtp] Generating OTP template");
    subject = "Verification Code - Tasty Kitchen";
    
    // Create OTP digits with table-based layout for better email support
    const otpDigits = String(code)
      .split("")
      .map((digit) => `
        <td style="padding: 0 5px;">
          <div style="width: 45px; height: 55px; line-height: 55px; background: #ffffff; border-radius: 8px; text-align: center; font-size: 24px; font-weight: 700; color: #ff6600; border: 1px solid #eeeeee;">
            ${digit}
          </div>
        </td>
      `)
      .join("");

    html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <title>Tasty Kitchen Verification</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f4f4; color: #333333;">
          <table border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td style="padding: 20px 0 30px 0;">
                <table align="center" border="0" cellpadding="0" cellspacing="0" width="500" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
                  <!-- Header -->
                  <tr>
                    <td align="center" style="background: linear-gradient(135deg, #ff6600 0%, #ff8533 100%); padding: 40px 0;">
                      <div style="background: rgba(255, 255, 255, 0.2); width: 70px; height: 70px; border-radius: 15px; line-height: 70px; margin-bottom: 15px;">
                        <span style="color: #ffffff; font-size: 32px; font-weight: 800;">TK</span>
                      </div>
                      <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">Tasty Kitchen</h1>
                    </td>
                  </tr>

                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <p style="margin: 0 0 20px 0; font-size: 18px; font-weight: 600;">Verification Code</p>
                      <p style="margin: 0 0 30px 0; font-size: 16px; line-height: 24px; color: #666666;">
                        Please use the following one-time password (OTP) to complete your verification process.
                      </p>

                      <!-- OTP Section -->
                      <table align="center" border="0" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                        <tr>
                          <td align="center" style="background-color: #fff5eb; padding: 30px; border-radius: 12px;">
                            <table border="0" cellpadding="0" cellspacing="0">
                              <tr>
                                ${otpDigits}
                              </tr>
                            </table>
                            <p style="margin: 20px 0 0 0; font-size: 14px; color: #ff6600; font-weight: 600; letter-spacing: 1px;">VALID FOR 5 MINUTES</p>
                          </td>
                        </tr>
                      </table>

                      <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 22px; color: #888888; text-align: center;">
                        If you did not request this code, you can safely ignore this email. Someone else might have typed your email address by mistake.
                      </p>

                      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-top: 1px solid #eeeeee; margin-top: 30px; padding-top: 30px;">
                        <tr>
                          <td>
                            <p style="margin: 0; font-size: 14px; font-weight: 700; color: #333333;">Why did I get this?</p>
                            <p style="margin: 5px 0 0 0; font-size: 13px; color: #999999;">We are verifying your email to keep your Tasty Kitchen account secure.</p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #fafafa; padding: 30px; text-align: center; border-top: 1px solid #eeeeee;">
                      <p style="margin: 0; font-size: 12px; color: #999999;">&copy; ${new Date().getFullYear()} Tasty Kitchen Platform. All rights reserved.</p>
                      <p style="margin: 10px 0 0 0; font-size: 12px; color: #999999;">
                        Need help? <a href="mailto:support@tastykitchen.com" style="color: #ff6600; text-decoration: none; font-weight: 600;">Contact Support</a>
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;
  }

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
  console.log("[sendEmailOtp] OTP_PROVIDER:", provider);
  const transportOpts = buildTransportOptions();
  console.log(
    "[sendEmailOtp] Transport options built:",
    !!transportOpts,
    transportOpts
      ? {
          service: transportOpts.service,
          host: transportOpts.host,
          port: transportOpts.port,
        }
      : null,
  );

  if ((provider === "smtp" || provider === "gmail") && transportOpts) {
    try {
      // Initialize transporter singleton if it doesn't exist
      if (!transporter) {
        console.log("[sendEmailOtp] Creating new nodemailer transporter");
        transporter = nodemailer.createTransport(transportOpts);
      }

      const fromEmail =
        process.env.EMAIL_FROM ||
        process.env.SMTP_USER ||
        "no-reply@example.com";
      console.log(
        "[sendEmailOtp] Attempting to send email from:",
        fromEmail,
        "to:",
        to,
      );

      const info = await transporter.sendMail({
        from: fromEmail,
        to,
        subject,
        html,
      });

      console.log(
        `[Email OTP] SUCCESS - Sent to ${to}, provider=${provider}, messageId: ${info.messageId}`,
      );
      return {
        ok: true,
        provider: provider === "gmail" ? "smtp(gmail)" : "smtp",
        messageId: info.messageId,
      };
    } catch (err) {
      console.error(
        "[Email OTP Error] FAILED:",
        err.message,
        err.code,
        err.response,
      );
      console.log(`[Email Mock Fallback] To ${to}: ${code}`);
      return { ok: true, provider: "mock", error: err.message };
    }
  }

  if (provider === "smtp" || provider === "gmail") {
    // provider requested but configuration is missing
    console.warn(
      `[Email OTP Warn] OTP_PROVIDER=${provider} but no SMTP configuration found; falling back to mock`,
    );
    console.warn("[Email OTP Warn] SMTP_SERVICE:", process.env.SMTP_SERVICE);
    console.warn("[Email OTP Warn] SMTP_HOST:", process.env.SMTP_HOST);
    console.warn(
      "[Email OTP Warn] SMTP_USER:",
      process.env.SMTP_USER
        ? process.env.SMTP_USER.substring(0, 5) + "***"
        : "undefined",
    );
  }

  // default mock behaviour (useful for local development)
  console.log(`[Email Mock] To ${to}: ${code}`);
  return { ok: true, provider: "mock" };
}
