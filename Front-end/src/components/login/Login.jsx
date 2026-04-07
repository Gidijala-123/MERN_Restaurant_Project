import React, { useState } from "react";
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

// Step: "login" | "forgot-email" | "forgot-otp" | "forgot-newpw"
function SignInForm({ toggleMobile }) {
  const [validationErrors, setValidationErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [uemail, setUemail] = useState("");
  const [upassword, setUpassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Forgot password state
  const [step, setStep] = useState("login");
  const [fpEmail, setFpEmail] = useState("");
  const [fpOtp, setFpOtp] = useState("");
  const [fpNewPw, setFpNewPw] = useState("");
  const [fpConfirmPw, setFpConfirmPw] = useState("");
  const [fpResetToken, setFpResetToken] = useState("");
  const [showFpPw, setShowFpPw] = useState(false);

  const API_BASE_URL = (
    import.meta.env.VITE_API_URL || "http://localhost:1111"
  ).replace(/\/$/, "");

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
    const toastId = toast.loading("Logging in... Please wait for server wake-up.");
    try {
      const csrfRes = await fetch(`${API_BASE_URL}/api/csrf`, { credentials: "include" });
      const { csrfToken } = (await csrfRes.json()) || {};
      const res = await axios.post(
        `${API_BASE_URL}/api/auth/login`,
        { uemail, upassword },
        { withCredentials: true, headers: { "x-csrf-token": csrfToken } },
      );
      if (res.status === 200) {
        toast.update(toastId, { render: "Login successful!", type: "success", isLoading: false, autoClose: 2000 });
        const user = res.data?.user;
        if (user) {
          if (user.uname) localStorage.setItem("userName", user.uname);
          if (user.avatar) localStorage.setItem("userAvatar", user.avatar);
          if (user.role) localStorage.setItem("userRole", user.role);
        }
        navigate(res.data?.user?.role === "admin" ? "/admin" : "/home");
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.Message || "Invalid email or password.";
      toast.update(toastId, { render: msg, type: "error", isLoading: false, autoClose: 3000 });
      setApiError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const sendFpOtp = async (e) => {
    e.preventDefault();
    if (!fpEmail) return toast.error("Enter your email");
    setIsLoading(true);
    const toastId = toast.loading("Sending OTP... This may take a moment on first request.");
    try {
      await axios.post(`${API_BASE_URL}/api/auth/forgot-password`, { uemail: fpEmail });
      toast.update(toastId, { render: "OTP sent to your email!", type: "success", isLoading: false, autoClose: 4000 });
      setStep("forgot-otp");
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to send OTP. Try again.";
      toast.update(toastId, { render: msg, type: "error", isLoading: false, autoClose: 4000 });
    } finally {
      setIsLoading(false);
    }
  };

  const verifyFpOtp = async (e) => {
    e.preventDefault();
    const cleanOtp = fpOtp.replace(/\D/g, "");
    if (cleanOtp.length !== 6) return toast.error("Enter the 6-digit OTP");
    setIsLoading(true);
    const toastId = toast.loading("Verifying OTP...");
    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/verify-forgot-otp`, {
        uemail: fpEmail,
        code: cleanOtp,
      });
      if (res.data?.ok) {
        setFpResetToken(res.data.resetToken);
        toast.update(toastId, { render: "✅ OTP verified!", type: "success", isLoading: false, autoClose: 3000 });
        setStep("forgot-newpw");
      } else {
        toast.update(toastId, { render: "Invalid or expired OTP. Please try again.", type: "error", isLoading: false, autoClose: 4000 });
      }
    } catch (err) {
      toast.update(toastId, { render: err.response?.data?.message || "Invalid or expired OTP.", type: "error", isLoading: false, autoClose: 4000 });
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (e) => {
    e.preventDefault();
    if (fpNewPw.length < 8) return toast.error("Password must be at least 8 characters");
    if (fpNewPw !== fpConfirmPw) return toast.error("Passwords do not match");
    setIsLoading(true);
    const toastId = toast.loading("Resetting your password...");
    try {
      await axios.post(`${API_BASE_URL}/api/auth/reset-password`, {
        resetToken: fpResetToken,
        newPassword: fpNewPw,
      });
      toast.update(toastId, { render: "Password reset successful! Please log in.", type: "success", isLoading: false, autoClose: 3000 });
      setStep("login");
      setFpEmail(""); setFpOtp(""); setFpNewPw(""); setFpConfirmPw(""); setFpResetToken("");
    } catch (err) {
      toast.update(toastId, { render: err.response?.data?.message || "Reset failed. Please start over.", type: "error", isLoading: false, autoClose: 4000 });
    } finally {
      setIsLoading(false);
    }
  };

  // ── Forgot password screens ──
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
              onChange={(e) => setFpEmail(e.target.value)} placeholder="Email Address" required />
          </div>
        </div>
        <button className="codepen-button" type="submit" disabled={isLoading}>
          {isLoading ? (
            <><span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true" />Sending...</>
          ) : "Send OTP"}
        </button>
        <div style={{ textAlign: "center", marginTop: "0.75rem" }}>
          <span style={{ fontSize: "0.82rem", color: "#ea580c", cursor: "pointer" }}
            onClick={() => setStep("login")}>← Back to Login</span>
        </div>
      </form>
    );
  }

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
              onPaste={(e) => {
                e.preventDefault();
                const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
                setFpOtp(pasted);
              }}
              placeholder="6-digit OTP" required />
          </div>
        </div>
        <button className="codepen-button" type="submit" disabled={isLoading || fpOtp.replace(/\D/g, "").length !== 6}>
          {isLoading ? (
            <><span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true" />Verifying...</>
          ) : "Verify OTP"}
        </button>
        <div style={{ textAlign: "center", marginTop: "0.75rem" }}>
          <span style={{ fontSize: "0.82rem", color: "#ea580c", cursor: "pointer" }}
            onClick={() => setStep("forgot-email")}>← Resend OTP</span>
        </div>
      </form>
    );
  }

  if (step === "forgot-newpw") {
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
        </div>
        <div className="mb-3">
          <div className="input-group">
            <span className="input-group-text icon-badge"><LockIcon fontSize="small" /></span>
            <input className="form-control" type={showFpPw ? "text" : "password"}
              value={fpConfirmPw} onChange={(e) => setFpConfirmPw(e.target.value)}
              placeholder="Confirm New Password" required />
          </div>
        </div>
        <button className="codepen-button" type="submit" disabled={isLoading}>
          {isLoading ? (
            <><span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true" />Resetting...</>
          ) : "Reset Password"}
        </button>
      </form>
    );
  }

  // ── Default login screen ──
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
            onChange={(e) => setUemail(e.target.value)} placeholder="Email Address"
            autoComplete="email" required />
        </div>
        {validationErrors.uemail && <span className="span-tag error-text">{validationErrors.uemail}</span>}
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

      <div style={{ textAlign: "right", marginTop: "-0.5rem", marginBottom: "0.75rem" }}>
        <span style={{ fontSize: "0.8rem", color: "#ea580c", cursor: "pointer", fontWeight: 600 }}
          onClick={() => { setStep("forgot-email"); setFpEmail(uemail); }}>
          Forgot password?
        </span>
      </div>

      <span className="span-tag error-text">{apiError}</span>
      <button className="codepen-button" type="submit" disabled={isLoading}>
        {isLoading ? "Processing..." : "Login"}
      </button>
      <div style={{ fontSize: "0.75rem", color: "#666", marginTop: "10px", textAlign: "center", fontStyle: "italic" }}>
        Note: Initial request may take 30-60 seconds due to server wake-up time on free hosting.
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
