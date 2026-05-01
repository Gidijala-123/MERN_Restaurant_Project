import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "../signup/Signup.css";
import axios from "axios";
import { loginSchema } from "../../validations/schemas";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import GoogleIcon from "@mui/icons-material/Google";
import GitHubIcon from "@mui/icons-material/GitHub";
import { toast } from "react-toastify";
import useDebounce from "../../hooks/useDebounce";

// Step: "login" | "forgot-email" | "forgot-otp" | "forgot-newpw"
function SignInForm({ toggleMobile }) {
  const API_BASE_URL = (import.meta.env.VITE_API_URL || 
    (window.location.hostname === "localhost" ? "http://localhost:1111" : window.location.origin)
  ).replace(/\/$/, "");

  const [validationErrors, setValidationErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [uemail, setUemail] = useState("");
  const [upassword, setUpassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Login email check — "idle" | "checking" | "found" | "notfound"
  const [loginEmailStatus, setLoginEmailStatus] = useState("idle");
  const loginEmailTimer = useRef(null);

  const checkLoginEmail = useCallback(async (email) => {
    const val = email.trim();
    if (!val || !/\S+@\S+\.\S+/.test(val)) return;
    setLoginEmailStatus("checking");
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/signupLoginRouter/checkEmail?email=${encodeURIComponent(val)}&_=${Date.now()}`,
        { credentials: "include", cache: "no-store" }
      );
      const data = await res.json();
      setLoginEmailStatus(data.exists ? "found" : "notfound");
      if (!data.exists) {
        setValidationErrors((p) => ({ ...p, uemail: "No account found with this email. Sign up instead." }));
      } else {
        setValidationErrors((p) => ({ ...p, uemail: "" }));
      }
    } catch {
      setLoginEmailStatus("idle");
    }
  }, [API_BASE_URL]);

  // Forgot password state
  const [step, setStep] = useState("login");
  const [fpEmail, setFpEmail] = useState("");
  const [fpOtp, setFpOtp] = useState("");
  const [fpNewPw, setFpNewPw] = useState("");
  const [fpConfirmPw, setFpConfirmPw] = useState("");
  const [fpResetToken, setFpResetToken] = useState("");
  const [showFpPw, setShowFpPw] = useState(false);
  const [fpEmailExists, setFpEmailExists] = useState("idle");

  // Pre-warm server on mount
  useEffect(() => {
    fetch(`${API_BASE_URL}/health`).catch(() => { });
  }, [API_BASE_URL]);

  // Debounce forgot-password email to check if it exists
  const debouncedFpEmail = useDebounce(fpEmail, 600);
  useEffect(() => {
    if (step !== "forgot-email") return;
    if (!debouncedFpEmail || !/\S+@\S+\.\S+/.test(debouncedFpEmail)) {
      setFpEmailExists("idle");
      return;
    }
    setFpEmailExists("checking");
    fetch(`${API_BASE_URL}/api/signupLoginRouter/checkEmail?email=${encodeURIComponent(debouncedFpEmail)}&_=${Date.now()}`, { credentials: "include", cache: "no-store" })
      .then((r) => r.json())
      .then((data) => setFpEmailExists(data.exists ? "found" : "notfound"))
      .catch(() => setFpEmailExists("idle"));
  }, [debouncedFpEmail, step, API_BASE_URL]);

  // ── Login ──────────────────────────────────────────────────────────────────
  const loginOnSubmit = async (e) => {
    e.preventDefault();
    setValidationErrors({});
    setApiError("");
    try {
      await loginSchema.validate({ uemail, upassword }, { abortEarly: false });
    } catch (err) {
      const errors = {};
      err.inner.forEach((e) => { errors[e.path] = e.message; });
      setValidationErrors(errors);
      return;
    }
    setIsLoading(true);
    const toastId = toast.loading("Logging in...");
    try {
      const csrfRes = await fetch(`${API_BASE_URL}/api/csrf`, { credentials: "include" });
      const { csrfToken } = (await csrfRes.json()) || {};
      const res = await axios.post(
        `${API_BASE_URL}/api/auth/login`,
        { uemail, upassword },
        { withCredentials: true, headers: { "x-csrf-token": csrfToken } },
      );
      if (res.status === 200) {
        toast.update(toastId, { render: "Login successful!", type: "success", isLoading: false, autoClose: 1500 });
        const user = res.data?.user;
        if (user) {
          if (user.uname) localStorage.setItem("userName", user.uname);
          if (user.avatar) localStorage.setItem("userAvatar", user.avatar);
          if (user.role) localStorage.setItem("userRole", user.role);
          if (user.uemail) localStorage.setItem("userEmail", user.uemail);
        }
        navigate("/home");
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.Message || "Invalid email or password.";
      toast.update(toastId, { render: msg, type: "error", isLoading: false, autoClose: 1500 });
      setApiError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Forgot password — send OTP ─────────────────────────────────────────────
  const sendFpOtp = async (e) => {
    e.preventDefault();
    if (!fpEmail) return toast.error("Enter your email");
    if (fpEmailExists === "notfound") return toast.error("No account found with this email.");
    setIsLoading(true);
    const toastId = toast.loading("Sending OTP...");
    try {
      await axios.post(`${API_BASE_URL}/api/auth/forgot-password`, { uemail: fpEmail });
      toast.update(toastId, { render: "OTP sent to your email!", type: "success", isLoading: false, autoClose: 1500 });
      setStep("forgot-otp");
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to send OTP. Try again.";
      toast.update(toastId, { render: msg, type: "error", isLoading: false, autoClose: 1500 });
    } finally {
      setIsLoading(false);
    }
  };

  // ── Forgot password — verify OTP ───────────────────────────────────────────
  const verifyFpOtp = async (e) => {
    e.preventDefault();
    const cleanOtp = fpOtp.replace(/\D/g, "");
    if (cleanOtp.length !== 6) return toast.error("Enter the 6-digit OTP");
    setIsLoading(true);
    const toastId = toast.loading("Verifying OTP...");
    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/verify-forgot-otp`, { uemail: fpEmail, code: cleanOtp });
      if (res.data?.ok) {
        setFpResetToken(res.data.resetToken);
        toast.update(toastId, { render: "✅ OTP verified!", type: "success", isLoading: false, autoClose: 1500 });
        setStep("forgot-newpw");
      } else {
        toast.update(toastId, { render: "Invalid or expired OTP. Please try again.", type: "error", isLoading: false, autoClose: 1500 });
      }
    } catch (err) {
      toast.update(toastId, { render: err.response?.data?.message || "Invalid or expired OTP.", type: "error", isLoading: false, autoClose: 1500 });
    } finally {
      setIsLoading(false);
    }
  };

  // ── Forgot password — reset ────────────────────────────────────────────────
  const resetPassword = async (e) => {
    e.preventDefault();
    if (fpNewPw.length < 8) return toast.error("Password must be at least 8 characters");
    if (fpNewPw !== fpConfirmPw) return toast.error("Passwords do not match");
    setIsLoading(true);
    const toastId = toast.loading("Resetting your password...");
    try {
      await axios.post(`${API_BASE_URL}/api/auth/reset-password`, { resetToken: fpResetToken, newPassword: fpNewPw });
      toast.update(toastId, { render: "Password reset successful! Please log in.", type: "success", isLoading: false, autoClose: 1500 });
      setStep("login");
      setFpEmail(""); setFpOtp(""); setFpNewPw(""); setFpConfirmPw(""); setFpResetToken("");
    } catch (err) {
      toast.update(toastId, { render: err.response?.data?.message || "Reset failed. Please start over.", type: "error", isLoading: false, autoClose: 1500 });
    } finally {
      setIsLoading(false);
    }
  };

  // ── Forgot password — enter email ──────────────────────────────────────────
  if (step === "forgot-email") {
    return (
      <form className="form-div" onSubmit={sendFpOtp}>
        <div className="login-heading">
          <img src="/user-ani.webp" alt="profile" className="auth-illustration" style={{ borderRadius: "50%" }} />
          <h1 className="heading-h1">Forgot Password</h1>
        </div>
        <p style={{ fontSize: "0.82rem", color: "#666", textAlign: "center", marginBottom: "1rem" }}>
          Enter your registered email and we'll send you an OTP to reset your password.
        </p>
        <div className="mb-3">
          <div className="input-group">
            <span className="input-group-text icon-badge"><EmailIcon fontSize="small" /></span>
            <input className="form-control" type="email" value={fpEmail}
              onChange={(e) => { setFpEmail(e.target.value); setFpEmailExists("idle"); }}
              placeholder="Email Address" required />
            {fpEmailExists === "checking" && (
              <span className="input-group-text" style={{ background: "transparent", border: "none" }}>
                <span className="spinner-border spinner-border-sm text-secondary" role="status" aria-hidden="true" />
              </span>
            )}
            {fpEmailExists === "found" && (
              <span className="input-group-text" style={{ background: "transparent", border: "none", color: "#059669", fontWeight: 700 }}>✓</span>
            )}
            {fpEmailExists === "notfound" && (
              <span className="input-group-text" style={{ background: "transparent", border: "none", color: "#dc2626", fontWeight: 700 }}>✗</span>
            )}
          </div>
          {fpEmailExists === "notfound" && (
            <span className="span-tag error-text">
              No account found with this email.{" "}
              <span onClick={() => { setStep("login"); toggleMobile?.(); }}
                style={{ color: "#ea580c", cursor: "pointer", textDecoration: "underline", fontWeight: 700 }}>
                Sign up instead →
              </span>
            </span>
          )}
        </div>
        <button className="codepen-button" type="submit"
          disabled={isLoading || fpEmailExists === "notfound" || fpEmailExists === "checking"}>
          {isLoading
            ? <><span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true" />Sending...</>
            : "Send OTP"}
        </button>
        <div style={{ textAlign: "center", marginTop: "0.75rem" }}>
          <span style={{ fontSize: "0.82rem", color: "#ea580c", cursor: "pointer" }}
            onClick={() => setStep("login")}>← Back to Login</span>
        </div>
      </form>
    );
  }

  // ── Forgot password — enter OTP ────────────────────────────────────────────
  if (step === "forgot-otp") {
    return (
      <form className="form-div" onSubmit={verifyFpOtp}>
        <div className="login-heading">
          <img src="/user-ani.webp" alt="profile" className="auth-illustration" style={{ borderRadius: "50%" }} />
          <h1 className="heading-h1">Enter OTP</h1>
        </div>
        <p style={{ fontSize: "0.82rem", color: "#666", textAlign: "center", marginBottom: "1rem" }}>
          OTP sent to <strong>{fpEmail}</strong>. Valid for 5 minutes.
        </p>
        <div className="mb-3">
          <div className="input-group">
            <span className="input-group-text icon-badge"><LockIcon fontSize="small" /></span>
            <input className="form-control" type="text" inputMode="numeric" maxLength={6}
              value={fpOtp}
              onChange={(e) => setFpOtp(e.target.value.replace(/\D/g, ""))}
              onPaste={(e) => { e.preventDefault(); setFpOtp(e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6)); }}
              placeholder="6-digit OTP" autoFocus required />
          </div>
        </div>
        <button className="codepen-button" type="submit" disabled={isLoading || fpOtp.replace(/\D/g, "").length !== 6}>
          {isLoading
            ? <><span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true" />Verifying...</>
            : "Verify OTP"}
        </button>
        <div style={{ textAlign: "center", marginTop: "0.75rem" }}>
          <span style={{ fontSize: "0.82rem", color: "#ea580c", cursor: "pointer" }}
            onClick={() => setStep("forgot-email")}>← Resend OTP</span>
        </div>
      </form>
    );
  }

  // ── Forgot password — new password ─────────────────────────────────────────
  if (step === "forgot-newpw") {
    const pwMismatch = fpConfirmPw.length > 0 && fpNewPw !== fpConfirmPw;
    return (
      <form className="form-div" onSubmit={resetPassword}>
        <div className="login-heading">
          <img src="/user-ani.webp" alt="profile" className="auth-illustration" style={{ borderRadius: "50%" }} />
          <h1 className="heading-h1">New Password</h1>
        </div>
        <div className="mb-3">
          <div className="input-group">
            <span className="input-group-text icon-badge"><LockIcon fontSize="small" /></span>
            <input className="form-control" type={showFpPw ? "text" : "password"}
              value={fpNewPw} onChange={(e) => setFpNewPw(e.target.value)}
              placeholder="New Password (min 8 chars)" required />
            <button type="button" className="btn btn-outline-secondary"
              onClick={() => setShowFpPw(!showFpPw)} aria-label="Toggle password visibility">
              {showFpPw ? <VisibilityOff /> : <Visibility />}
            </button>
          </div>
          {fpNewPw.length > 0 && fpNewPw.length < 8 && (
            <span className="span-tag error-text">Password must be at least 8 characters</span>
          )}
        </div>
        <div className="mb-3">
          <div className="input-group">
            <span className="input-group-text icon-badge"><LockIcon fontSize="small" /></span>
            <input className="form-control" type={showFpPw ? "text" : "password"}
              value={fpConfirmPw} onChange={(e) => setFpConfirmPw(e.target.value)}
              placeholder="Confirm New Password" required />
            {!pwMismatch && fpConfirmPw.length > 0 && (
              <span className="input-group-text" style={{ background: "transparent", border: "none", color: "#059669", fontWeight: 700 }}>✓</span>
            )}
          </div>
          {pwMismatch && <span className="span-tag error-text">Passwords do not match</span>}
        </div>
        <button className="codepen-button" type="submit"
          disabled={isLoading || fpNewPw.length < 8 || pwMismatch}>
          {isLoading
            ? <><span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true" />Resetting...</>
            : "Reset Password"}
        </button>
      </form>
    );
  }

  // ── Default login screen ───────────────────────────────────────────────────
  return (
    <form className="form-div" onSubmit={loginOnSubmit}>
      <div className="login-heading">
        <img src="/user-ani.webp" alt="profile" className="auth-illustration" style={{ borderRadius: "50%" }} />
        <h1 className="heading-h1">Welcome Back</h1>
      </div>
      <div className="mb-3">
        <div className="input-group">
          <span className="input-group-text icon-badge"><EmailIcon fontSize="small" /></span>
          <input className="form-control" type="email" id="login-email" value={uemail}
            onChange={(e) => {
              const val = e.target.value;
              setUemail(val);
              setLoginEmailStatus("idle");
              setValidationErrors((p) => ({ ...p, uemail: "" }));
              // Handle autocomplete fill
              if (/\S+@\S+\.\S+/.test(val.trim())) {
                clearTimeout(loginEmailTimer.current);
                loginEmailTimer.current = setTimeout(() => checkLoginEmail(val), 800);
              }
            }}
            onBlur={() => { clearTimeout(loginEmailTimer.current); checkLoginEmail(uemail); }}
            placeholder="Email Address"
            autoComplete="email" required />
          {loginEmailStatus === "checking" && (
            <span className="input-group-text" style={{ background: "transparent", border: "none" }}>
              <span className="spinner-border spinner-border-sm text-secondary" role="status" aria-hidden="true" />
            </span>
          )}
          {loginEmailStatus === "found" && (
            <span className="input-group-text" style={{ background: "transparent", border: "none", padding: "0 4px" }}>
              <span className="email-status-icon tick">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <polyline className="tick-path" points="1.5,6 4.5,9.5 10.5,2.5"
                    stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </span>
          )}
          {loginEmailStatus === "notfound" && (
            <span className="input-group-text" style={{ background: "transparent", border: "none", padding: "0 4px" }}>
              <span className="email-status-icon cross">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <line className="cross-path" x1="2" y1="2" x2="10" y2="10" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" />
                  <line className="cross-path" x1="10" y1="2" x2="2" y2="10" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </span>
            </span>
          )}
        </div>
        {validationErrors.uemail && (
          <span className="span-tag error-text">
            {validationErrors.uemail}
            {validationErrors.uemail.includes("Sign up") && (
              <span onClick={toggleMobile}
                style={{ marginLeft: "6px", color: "#ea580c", cursor: "pointer", textDecoration: "underline", fontWeight: 700 }}>
                Sign up →
              </span>
            )}
          </span>
        )}
      </div>
      <div className="mb-3">
        <div className="input-group">
          <span className="input-group-text icon-badge"><LockIcon fontSize="small" /></span>
          <input className="form-control" type={showPassword ? "text" : "password"} id="login-password"
            value={upassword} onChange={(e) => setUpassword(e.target.value)}
            placeholder="Password" autoComplete="current-password" required />
          <button type="button" className="btn btn-outline-secondary"
            onClick={() => setShowPassword(!showPassword)} aria-label="Toggle password visibility">
            {showPassword ? <VisibilityOff /> : <Visibility />}
          </button>
        </div>
        {validationErrors.upassword && <span className="span-tag error-text">{validationErrors.upassword}</span>}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "-0.5rem", marginBottom: "0.75rem" }}>
        <span className="span-tag error-text" style={{ margin: 0 }}>{apiError}</span>
        <span style={{ fontSize: "0.8rem", color: "#ea580c", cursor: "pointer", fontWeight: 600 }}
          onClick={() => { setStep("forgot-email"); setFpEmail(uemail); }}>
          Forgot password?
        </span>
      </div>

      <button className="codepen-button" type="submit"
        disabled={isLoading || loginEmailStatus === "notfound" || loginEmailStatus === "checking" || !uemail.trim() || !upassword.trim()}
        style={{ opacity: (!uemail.trim() || !upassword.trim() || loginEmailStatus === "notfound") ? 0.6 : 1, cursor: (!uemail.trim() || !upassword.trim() || loginEmailStatus === "notfound") ? "not-allowed" : "pointer" }}>
        {isLoading
          ? <><span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true" />Logging in...</>
          : "Login"}
      </button>
      <div style={{ fontSize: "0.75rem", color: "#666", marginTop: "10px", textAlign: "center", fontStyle: "italic" }}>
        First request may take ~30s on free hosting (Render cold start)
      </div>
      <div className="auth-social-row" style={{ marginTop: "0.75rem" }}>
        <button type="button" className="codepen-button"
          onClick={() => (window.location.href = `${API_BASE_URL}/api/oauth/google`)}>
          <span className="btn-icon"><GoogleIcon fontSize="small" /></span> Login with Google
        </button>
        <button type="button" className="codepen-button"
          onClick={() => (window.location.href = `${API_BASE_URL}/api/oauth/github`)}>
          <span className="btn-icon"><GitHubIcon fontSize="small" /></span> Login with GitHub
        </button>
      </div>
      <div className="mobile-toggle">
        Don't have an account? <span onClick={toggleMobile}>Sign Up</span>
      </div>
    </form>
  );
}

export default SignInForm;
