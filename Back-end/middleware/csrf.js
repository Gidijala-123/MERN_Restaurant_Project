import { randomBytes } from "crypto";

export function issueCsrf(req, res) {
  const token = randomBytes(24).toString("hex");
  res.cookie("csrfToken", token, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 1000,
  });
  res.json({ csrfToken: token });
}

export function checkCsrf(req, res, next) {
  if (String(process.env.CSRF_ENABLED || "true") !== "true") return next();
  const cookieToken = req.cookies?.csrfToken;
  const headerToken = req.headers["x-csrf-token"];
  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return res.status(403).json({ message: "CSRF validation failed" });
  }
  next();
}
