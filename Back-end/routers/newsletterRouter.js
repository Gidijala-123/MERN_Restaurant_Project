import express from "express";
import { subscribeEmail, sendToAll } from "../services/newsletterService.js";
import { verifyAccessToken } from "../middleware/auth.js";
import { checkCsrf } from "../middleware/csrf.js"; // ensure correct path

const router = express.Router();

// subscribe endpoint
router.post("/subscribe", checkCsrf, async (req, res) => {
  const { email } = req.body || {};
  if (!email) return res.status(400).json({ message: "Email required" });
  try {
    const sub = await subscribeEmail(email.toLowerCase());
    res.json({ ok: true, subscriber: sub });
  } catch (err) {
    console.error("[Newsletter] Subscribe error:", err.message);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// admin trigger to send newsletters (could be protected)
router.post("/send", verifyAccessToken, async (req, res) => {
  try {
    await sendToAll();
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

export default router;
