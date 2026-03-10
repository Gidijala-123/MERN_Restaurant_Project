export async function sendSmsOtp({ to, code }) {
  const provider = process.env.OTP_PROVIDER || "mock";
  if (provider === "twilio") {
    // integrate Twilio here when SID/TOKEN exist in env
    // await twilio.messages.create({ to, from: process.env.TWILIO_FROM, body: `Your OTP is ${code}` });
  }
  console.log(`SMS OTP to ${to}: ${code}`);
  return { ok: true };
}

export async function sendWhatsAppOtp({ to, code }) {
  const provider = process.env.OTP_PROVIDER || "mock";
  if (provider === "twilio") {
    // await twilio.messages.create({ to: `whatsapp:${to}`, from: `whatsapp:${process.env.TWILIO_WHATSAPP_FROM}`, body: `Your OTP is ${code}` });
  }
  console.log(`WhatsApp OTP to ${to}: ${code}`);
  return { ok: true };
}
