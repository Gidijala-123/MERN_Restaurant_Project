/**
 * mailer.js — Nodemailer + Gmail SMTP transporter
 *
 * Uses a persistent, connection-pooled transporter so the TCP/TLS
 * handshake is done once and reused for every subsequent send.
 * This is the single source of truth for all outgoing email.
 */
import nodemailer from "nodemailer";
import dns from "dns";

let _transporter = null;

function getTransporter() {
  if (_transporter) return _transporter;

  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    throw new Error("GMAIL_USER and GMAIL_APP_PASSWORD must be set in environment variables.");
  }

  _transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,              // use SSL
    pool: true,
    maxConnections: 5,
    maxMessages: Infinity,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
    tls: {
      rejectUnauthorized: true,
    },
    // Force IPv4 to prevent ENETUNREACH errors on cloud platforms like Render
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
    dnsLookup: (hostname, options, callback) => {
      dns.lookup(hostname, { family: 4 }, callback);
    }
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
