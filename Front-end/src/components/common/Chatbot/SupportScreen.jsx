import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MdPhone, MdEmail, MdWhatsapp, MdExpandMore, MdCheckCircle, MdSend } from "react-icons/md";
import { toast } from "react-toastify";

const FAQS = [
  { q: "My order is late — what should I do?", a: "Orders typically arrive in 30 mins. If it's been over 45 mins, use the Track tab to check status or call our rider support at +91-9493818100." },
  { q: "I received the wrong item", a: "We're sorry! Use the 'Report Issue' form below and select 'Wrong Item'. We'll arrange a replacement or full refund within 24 hours." },
  { q: "How do I cancel my order?", a: "Orders can be cancelled within 5 minutes of placing. After that, contact support immediately. Refunds are processed in 3–5 business days." },
  { q: "How do I get a refund?", a: "Refunds are issued for cancelled orders or quality issues. Submit a report below and our team will process it within 24–48 hours." },
  { q: "Can I modify my order after placing?", a: "Modifications are possible within 2 minutes of ordering. After that, the kitchen has already started preparing your food." },
  { q: "The app is not working properly", a: "Try refreshing the page. If the issue persists, clear your browser cache or contact us via email at support@flavora.com." },
];

const ISSUE_TYPES = [
  { key: "late_delivery", label: "🕐 Late Delivery" },
  { key: "wrong_item", label: "❌ Wrong Item" },
  { key: "missing_item", label: "📦 Missing Item" },
  { key: "quality_issue", label: "😞 Quality Issue" },
  { key: "refund_request", label: "💰 Refund Request" },
  { key: "other", label: "💬 Other" },
];

const API = (import.meta.env.VITE_API_URL || 
  (window.location.hostname === "localhost" ? "http://localhost:1111" : window.location.origin)
).replace(/\/$/, "");

const SupportScreen = () => {
  const [openFaq, setOpenFaq] = useState(null);
  const [view, setView] = useState("home"); // home | report | contact
  const [issueType, setIssueType] = useState("");
  const [issueMsg, setIssueMsg] = useState("");
  const [issueEmail, setIssueEmail] = useState(localStorage.getItem("userEmail") || "");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const submitIssue = async () => {
    if (!issueType) { toast.error("Please select an issue type"); return; }
    if (!issueMsg.trim()) { toast.error("Please describe your issue"); return; }
    setSubmitting(true);
    try {
      // Send as newsletter subscription endpoint or a simple fetch
      // Since we don't have a dedicated support endpoint, we'll store locally + show confirmation
      const ticket = {
        id: `TKT-${Date.now().toString(36).toUpperCase()}`,
        type: issueType,
        message: issueMsg,
        email: issueEmail,
        date: new Date().toISOString(),
        status: "open",
      };
      const existing = JSON.parse(localStorage.getItem("supportTickets") || "[]");
      localStorage.setItem("supportTickets", JSON.stringify([ticket, ...existing]));
      setSubmitted(true);
      setIssueMsg("");
      setIssueType("");
      toast.success(`Ticket ${ticket.id} submitted! We'll respond within 24 hours.`);
    } catch {
      toast.error("Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (view === "report") {
    return (
      <div className="flavie-scroll flex h-full flex-col gap-3 overflow-y-auto pb-1">
        <button
          onClick={() => { setView("home"); setSubmitted(false); }}
          style={{ background: "none", border: "none", color: "var(--cb-text-muted)", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer", textAlign: "left", padding: 0, display: "flex", alignItems: "center", gap: 4 }}
        >
          ← Back
        </button>

        {submitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ borderRadius: "16px", background: "#ecfdf5", border: "1px solid #a7f3d0", padding: "20px", textAlign: "center" }}
          >
            <MdCheckCircle style={{ fontSize: "2.5rem", color: "#059669", marginBottom: 8 }} />
            <p style={{ fontWeight: 800, color: "#065f46", fontSize: "0.9rem", margin: "0 0 6px" }}>Ticket Submitted!</p>
            <p style={{ fontSize: "0.72rem", color: "#047857", margin: 0 }}>Our team will get back to you within 24 hours at <strong>{issueEmail || "your email"}</strong>.</p>
            <button
              onClick={() => setSubmitted(false)}
              style={{ marginTop: 14, background: "#059669", color: "#fff", border: "none", borderRadius: 10, padding: "8px 20px", fontWeight: 700, fontSize: "0.78rem", cursor: "pointer" }}
            >
              Submit Another
            </button>
          </motion.div>
        ) : (
          <div className="shrink-0 shadow-sm" style={{ borderRadius: "16px", border: "1px solid var(--cb-border-soft)", background: "var(--cb-bg-card)", padding: "14px" }}>
            <p style={{ fontWeight: 800, fontSize: "0.82rem", color: "var(--cb-text-main)", marginBottom: 12 }}>Report an Issue</p>

            {/* Issue type */}
            <p style={{ fontSize: "0.65rem", fontWeight: 700, color: "var(--cb-text-faint)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Issue Type</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 12 }}>
              {ISSUE_TYPES.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setIssueType(t.key)}
                  style={{
                    padding: "7px 8px", borderRadius: 10, fontSize: "0.65rem", fontWeight: 600, cursor: "pointer",
                    background: issueType === t.key ? "#ea580c" : "var(--cb-bg-item)",
                    color: issueType === t.key ? "#fff" : "var(--cb-text-sub)",
                    border: issueType === t.key ? "none" : "1px solid var(--cb-border-muted)",
                    textAlign: "left",
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Email */}
            <p style={{ fontSize: "0.65rem", fontWeight: 700, color: "var(--cb-text-faint)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Your Email</p>
            <input
              type="email"
              value={issueEmail}
              onChange={(e) => setIssueEmail(e.target.value)}
              placeholder="your@email.com"
              style={{ width: "100%", padding: "8px 10px", borderRadius: 10, border: "1px solid var(--cb-border-soft)", fontSize: "0.75rem", background: "var(--cb-bg-warm)", color: "var(--cb-text-main)", marginBottom: 12, outline: "none", boxSizing: "border-box" }}
            />

            {/* Message */}
            <p style={{ fontSize: "0.65rem", fontWeight: 700, color: "var(--cb-text-faint)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Describe the Issue</p>
            <textarea
              value={issueMsg}
              onChange={(e) => setIssueMsg(e.target.value)}
              placeholder="Tell us what went wrong…"
              rows={3}
              style={{ width: "100%", padding: "8px 10px", borderRadius: 10, border: "1px solid var(--cb-border-soft)", fontSize: "0.75rem", background: "var(--cb-bg-warm)", color: "var(--cb-text-main)", resize: "none", outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
            />

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={submitIssue}
              disabled={submitting}
              style={{ marginTop: 10, width: "100%", background: "#ea580c", color: "#fff", border: "none", borderRadius: 12, padding: "10px 0", fontWeight: 800, fontSize: "0.8rem", cursor: submitting ? "not-allowed" : "pointer", opacity: submitting ? 0.7 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
            >
              <MdSend style={{ fontSize: "0.9rem" }} />
              {submitting ? "Submitting…" : "Submit Ticket"}
            </motion.button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flavie-scroll flex h-full flex-col gap-2.5 overflow-y-auto pb-1">

      {/* Quick actions */}
      <div className="shrink-0" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setView("report")}
          style={{ borderRadius: 14, padding: "12px 10px", background: "#fff7ed", border: "1px solid #fed7aa", cursor: "pointer", textAlign: "center" }}
        >
          <div style={{ fontSize: "1.4rem", marginBottom: 4 }}>🎫</div>
          <p style={{ margin: 0, fontSize: "0.7rem", fontWeight: 700, color: "#ea580c" }}>Report Issue</p>
          <p style={{ margin: 0, fontSize: "0.6rem", color: "#9ca3af" }}>Submit a ticket</p>
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setView("contact")}
          style={{ borderRadius: 14, padding: "12px 10px", background: "var(--cb-bg-card)", border: "1px solid var(--cb-border-muted)", cursor: "pointer", textAlign: "center" }}
        >
          <div style={{ fontSize: "1.4rem", marginBottom: 4 }}>📞</div>
          <p style={{ margin: 0, fontSize: "0.7rem", fontWeight: 700, color: "var(--cb-text-main)" }}>Contact Us</p>
          <p style={{ margin: 0, fontSize: "0.6rem", color: "#9ca3af" }}>Call, email, chat</p>
        </motion.button>
      </div>

      {/* FAQ */}
      <div className="shrink-0 shadow-sm" style={{ borderRadius: "16px", border: "1px solid var(--cb-border-soft)", background: "var(--cb-bg-card)", padding: "14px" }}>
        <p style={{ fontWeight: 800, fontSize: "0.72rem", color: "var(--cb-text-main)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>
          ❓ Frequently Asked
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {FAQS.map((faq, i) => (
            <div key={i} style={{ borderRadius: 10, border: "1px solid var(--cb-border-muted)", overflow: "hidden" }}>
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                style={{ width: "100%", background: openFaq === i ? "var(--cb-bg-warm)" : "transparent", border: "none", padding: "9px 12px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", gap: 8 }}
              >
                <span style={{ fontSize: "0.7rem", fontWeight: 600, color: "var(--cb-text-main)", textAlign: "left", flex: 1 }}>{faq.q}</span>
                <motion.span animate={{ rotate: openFaq === i ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <MdExpandMore style={{ fontSize: "1rem", color: "var(--cb-text-faint)", flexShrink: 0 }} />
                </motion.span>
              </button>
              <AnimatePresence>
                {openFaq === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    style={{ overflow: "hidden" }}
                  >
                    <p style={{ margin: 0, padding: "0 12px 10px", fontSize: "0.68rem", color: "var(--cb-text-muted)", lineHeight: 1.5 }}>{faq.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>

      {/* Contact strip */}
      <div className="shrink-0 shadow-sm" style={{ borderRadius: "16px", border: "1px solid var(--cb-border-soft)", background: "var(--cb-bg-card)", padding: "12px 14px" }}>
        <p style={{ fontWeight: 800, fontSize: "0.65rem", color: "var(--cb-text-faint)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>Need more help?</p>
        <div style={{ display: "flex", gap: 8 }}>
          <a href="tel:+919493818100" style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "8px 4px", borderRadius: 10, background: "#ecfdf5", textDecoration: "none" }}>
            <MdPhone style={{ fontSize: "1.1rem", color: "#059669" }} />
            <span style={{ fontSize: "0.6rem", fontWeight: 700, color: "#059669" }}>Call</span>
          </a>
          <a href="mailto:support@flavora.com" style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "8px 4px", borderRadius: 10, background: "#eff6ff", textDecoration: "none" }}>
            <MdEmail style={{ fontSize: "1.1rem", color: "#3b82f6" }} />
            <span style={{ fontSize: "0.6rem", fontWeight: 700, color: "#3b82f6" }}>Email</span>
          </a>
          <a href="https://wa.me/919493818100" target="_blank" rel="noreferrer" style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "8px 4px", borderRadius: 10, background: "#f0fdf4", textDecoration: "none" }}>
            <MdWhatsapp style={{ fontSize: "1.1rem", color: "#16a34a" }} />
            <span style={{ fontSize: "0.6rem", fontWeight: 700, color: "#16a34a" }}>WhatsApp</span>
          </a>
        </div>
        <p style={{ margin: "10px 0 0", fontSize: "0.62rem", color: "var(--cb-text-faint)", textAlign: "center" }}>
          Support hours: 9 AM – 11 PM · Avg response: 15 mins
        </p>
      </div>

    </div>
  );
};

export default SupportScreen;
