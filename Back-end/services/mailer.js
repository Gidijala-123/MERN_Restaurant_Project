/**
 * mailer.js — Nodemailer + Gmail SMTP transporter
 *
 * Uses a persistent, connection-pooled transporter so the TCP/TLS
 * handshake is done once and reused for every subsequent send.
 * This is the single source of truth for all outgoing email.
 */
import nodemailer from "nodemailer";

let _transporter = null;

function getTransporter() {
  if (_transporter) return _transporter;

  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    throw new Error("GMAIL_USER and GMAIL_APP_PASSWORD must be set in environment variables.");
  }

  _transporter = nodemailer.createTransport({
    service: "gmail",          // resolves host/port automatically
    pool: true,                // keep connections alive — faster for bursts
    maxConnections: 5,
    maxMessages: Infinity,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD, // 16-char App Password, NOT your Gmail password
    },
    tls: {
      rejectUnauthorized: true,
    },
  });

  return _transporter;
}

/**
 * sendMail({ to, subject, html })
 * Throws on failure so callers can surface the error to the client.
 */
export async function sendMail({ to, subject, html }) {
  try {
    const transporter = getTransporter();

    const info = await transporter.sendMail({
      from: `"${process.env.GMAIL_FROM_NAME || "Flavora"}" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log(`[Mailer] Sent to ${to} — messageId: ${info.messageId}`);
    return info;
  } catch (err) {
    console.error(`[Mailer Error] Failed to send to ${to}:`, err.message);
    throw err;
  }
}
