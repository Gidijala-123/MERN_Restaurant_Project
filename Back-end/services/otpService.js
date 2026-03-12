export async function sendSmsOtp({ to, code }) {
  const provider = process.env.OTP_PROVIDER || "mock";
  const message = `Your GBR Grocery verification code is: ${code}. Valid for 5 minutes. Do not share this code.`;

  if (provider === "twilio" && process.env.TWILIO_ACCOUNT_SID) {
    try {
      const twilio = require("twilio");
      const client = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
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
        process.env.TWILIO_AUTH_TOKEN
      );

      const response = await client.messages.create({
        body: message,
        from: `whatsapp:${process.env.TWILIO_WHATSAPP_FROM}`,
        to: `whatsapp:${to.startsWith("+") ? to : '+' + to}`,
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
