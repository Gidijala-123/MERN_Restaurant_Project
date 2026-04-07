import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../signup/Signup.css";
import Login from "../login/Login";
import { PopupAlert } from "../common/PopupAlert";
import axios from "axios";
import { signupSchema } from "../../validations/schemas";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import EditIcon from "@mui/icons-material/Edit";
import GoogleIcon from "@mui/icons-material/Google";
import GitHubIcon from "@mui/icons-material/GitHub";
import { toast } from "react-toastify";
import useDebounce from "../../hooks/useDebounce";

const BG_IMAGES = ["/dark1.jpg", "/dark2.jpg", "/dark3.jpg"];

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:1111").replace(/\/$/, "");

// Fetch and cache CSRF token — shared across send + verify so we only hit the
// server once. Resets if the token is missing (e.g. after a server restart).
let _csrfCache = "";
async function getCsrf() {
  if (_csrfCache) return _csrfCache;
  try {
    const res = await fetch(`${API_URL}/api/csrf`, { credentials: "include" });
    const data = await res.json();
    _csrfCache = data?.csrfToken || "";
  } catch {
    _csrfCache = "";
  }
  return _csrfCache;
}

function Signup() {
  const [type, setType] = useState("signUp");
  const [validationErrors, setValidationErrors] = useState({});
  const [apiStatus, setApiStatus] = useState({ error: "", success: "" });
  const [isLoading, setIsLoading] = useState(false);

  // Form fields
  const [uname, setUname] = useState("");
  const [uemail, setUemail] = useState("");
  const [upassword, setUpassword] = useState("");
  const [uconfirmPassword, setUconfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [avatar, setAvatar] = useState("");

  // OTP state
  const [channel, setChannel] = useState("email");
  const [contact, setContact] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpMsg, setOtpMsg] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [isOtpSending, setIsOtpSending] = useState(false);
  const [isOtpVerifying, setIsOtpVerifying] = useState(false);
  const [timer, setTimer] = useState(0);

  // Debounced email — fires check 600ms after user stops typing
  const debouncedEmail = useDebounce(uemail, 600);
  const [emailCheckStatus, setEmailCheckStatus] = useState("idle"); // idle | checking | taken | available

  // Auto-check email as user types
  useEffect(() => {
    if (!debouncedEmail || !/\S+@\S+\.\S+/.test(debouncedEmail)) {
      setEmailCheckStatus("idle");
      return;
    }
    setEmailCheckStatus("checking");
    fetch(`${API_URL}/api/signupLoginRouter/checkEmail?email=${encodeURIComponent(debouncedEmail)}`, { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        if (data.exists) {
          setEmailCheckStatus("taken");
          setValidationErrors((p) => ({ ...p, uemail: "This email is already registered. Please login instead." }));
        } else {
          setEmailCheckStatus("available");
          setValidationErrors((p) => ({ ...p, uemail: "" }));
        }
      })
      .catch(() => setEmailCheckStatus("idle"));
  }, [debouncedEmail]);

  // UI
  const [popup, setPopup] = useState({ visible: false, text: "" });
  const [bgIndex, setBgIndex] = useState(0);
  const [prevBgIndex, setPrevBgIndex] = useState(null);
  const navigate = useNavigate();
  const otpInputRef = useRef(null);

  // Background slideshow
  useEffect(() => {
    const id = setInterval(() => {
      setBgIndex((i) => { setPrevBgIndex(i); return (i + 1) % BG_IMAGES.length; });
    }, 6000);
    return () => clearInterval(id);
  }, []);

  // Countdown timer for OTP resend
  useEffect(() => {
    if (timer <= 0) return;
    const id = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [timer]);

  // Keep contact in sync when channel is email
  useEffect(() => {
    if (channel === "email") setContact(uemail);
  }, [channel, uemail]);

  // Pre-warm server AND prefetch CSRF token in parallel on mount.
  // By the time the user fills the form, the server is already awake
  // and the CSRF token is cached — Send OTP becomes a single API call.
  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/health`).catch(() => { }),
      getCsrf(),
    ]);
  }, []);

  const showPopup = (msg) => {
    setPopup({ visible: true, text: msg });
    setTimeout(() => setPopup({ visible: false, text: "" }), 3000);
  };

  const resetOtpState = () => {
    setOtpCode("");
    setOtpMsg("");
    setIsOtpSent(false);
    setIsOtpVerified(false);
    setTimer(0);
    _csrfCache = ""; // clear cache so next session gets a fresh token
  };

  const toggleSignupLogin = (text) => {
    if (text === type) return;
    setType(text);
    setValidationErrors({});
    setApiStatus({ error: "", success: "" });
    resetOtpState();
  };

  // ── Send OTP ──────────────────────────────────────────────────────────────
  const sendOtp = async () => {
    setValidationErrors({});
    setOtpMsg("");

    // Client-side validation before hitting the server
    const errors = {};
    if (!uname.trim()) errors.uname = "Name is required.";
    if (!uemail.trim()) errors.uemail = "Email is required.";
    if (!upassword) errors.upassword = "Password is required.";
    if (upassword !== uconfirmPassword) errors.uconfirmPassword = "Passwords do not match.";
    if (!contact.trim()) errors.contact = `Please enter your ${channel} for OTP.`;
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      toast.error("Please fill all required fields correctly.");
      return;
    }

    // Check if email already exists BEFORE showing loading state
    try {
      const checkRes = await fetch(
        `${API_URL}/api/signupLoginRouter/checkEmail?email=${encodeURIComponent(uemail)}`,
        { credentials: "include" }
      );
      const checkData = await checkRes.json();
      if (checkData.exists) {
        setValidationErrors({ uemail: "This email is already registered. Please login instead." });
        toast.error("This email is already registered.", { autoClose: 5000 });
        return;
      }
    } catch {
      // Network error on check — proceed anyway, backend will catch it on register
    }

    setIsOtpSending(true);
    const toastId = toast.loading("Sending OTP...");

    try {
      // getCsrf() returns the cached token instantly if already fetched on mount
      const token = await getCsrf();

      const res = await axios.post(
        `${API_URL}/api/otp/send`,
        { contact, channel },
        { withCredentials: true, headers: { "x-csrf-token": token } },
      );

      if (res.status === 200) {
        const icons = { email: "📧", sms: "📱", whatsapp: "💬" };
        const labels = {
          email: `email (${contact})`,
          sms: `SMS to ${contact}`,
          whatsapp: `WhatsApp to ${contact}`,
        };
        setIsOtpSent(true);
        setTimer(60);
        setOtpMsg(`OTP sent to ${contact}`);
        toast.update(toastId, {
          render: `${icons[channel]} OTP sent via ${labels[channel]}!`,
          type: "success", isLoading: false, autoClose: 5000,
        });
        showPopup(`${icons[channel]} OTP sent! Check your ${channel === "email" ? "inbox" : channel}.`);
        // Auto-focus OTP input
        setTimeout(() => otpInputRef.current?.focus(), 100);
      }
    } catch (err) {
      const msg = err.response?.data?.error || "Failed to send OTP. Please try again.";
      setOtpMsg(msg);
      toast.update(toastId, { render: msg, type: "error", isLoading: false, autoClose: 4000 });
      _csrfCache = ""; // reset cache on error — token may have expired
    } finally {
      setIsOtpSending(false);
    }
  };

  // ── Verify OTP ────────────────────────────────────────────────────────────
  const verifyOtp = async () => {
    setOtpMsg("");
    setIsOtpVerifying(true);
    const toastId = toast.loading("Verifying OTP...");

    try {
      // Reuse cached token — no extra server round-trip
      const token = await getCsrf();

      const res = await axios.post(
        `${API_URL}/api/otp/verify`,
        { contact, code: otpCode.trim() },
        { withCredentials: true, headers: { "x-csrf-token": token } },
      );

      if (res.data?.ok) {
        setIsOtpSent(false);
        setIsOtpVerified(true);
        setOtpCode("");
        setOtpMsg("");
        toast.update(toastId, { render: "✅ OTP verified!", type: "success", isLoading: false, autoClose: 3000 });
        showPopup("OTP verified successfully!");
      } else {
        setOtpMsg("Invalid or expired OTP.");
        toast.update(toastId, { render: "Invalid or expired OTP. Try again.", type: "error", isLoading: false, autoClose: 4000 });
        showPopup("The OTP you entered is incorrect or has expired.");
      }
    } catch {
      setOtpMsg("Verification failed. Please try again.");
      toast.update(toastId, { render: "Verification failed. Please try again.", type: "error", isLoading: false, autoClose: 4000 });
    } finally {
      setIsOtpVerifying(false);
    }
  };

  // ── Sign Up Submit ────────────────────────────────────────────────────────
  const signupOnSubmit = async (e) => {
    e.preventDefault();
    setValidationErrors({});
    setApiStatus({ error: "", success: "" });

    if (!isOtpVerified) {
      toast.error("Please verify your OTP before signing up.");
      return;
    }
    if (upassword !== uconfirmPassword) {
      setValidationErrors({ uconfirmPassword: "Passwords do not match." });
      return;
    }

    try {
      await signupSchema.validate({ uname, uemail, upassword }, { abortEarly: false });
    } catch (err) {
      const errors = {};
      err.inner.forEach((e) => { errors[e.path] = e.message; });
      setValidationErrors(errors);
      return;
    }

    setIsLoading(true);
    const toastId = toast.loading("Creating your account...");

    try {
      const res = await axios.post(
        `${API_URL}/api/signupLoginRouter/registerUser`,
        { uname, uemail, upassword, avatar },
      );

      if (res.status === 200) {
        toast.update(toastId, { render: "Account created! You can now log in.", type: "success", isLoading: false, autoClose: 3000 });
        setApiStatus({ error: "", success: "Registration successful! You can now log in." });
        // Reset entire form
        setUname(""); setUemail(""); setUpassword(""); setUconfirmPassword("");
        setContact(""); setAvatar(""); setChannel("email");
        resetOtpState();
        setValidationErrors({});
        setTimeout(() => toggleSignupLogin("signIn"), 2000);
      }
    } catch (err) {
      const msg = err.response?.data?.Message || err.response?.data?.Error || "Registration failed.";
      const isExisting = err.response?.status === 403;
      toast.update(toastId, { render: isExisting ? "This email is already registered. Please login." : msg, type: "error", isLoading: false, autoClose: 5000 });
      setApiStatus({ error: isExisting ? "This email is already registered. Please login instead." : msg, success: "" });
    } finally {
      setIsLoading(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <PopupAlert visible={popup.visible} text={popup.text} onClose={() => setPopup({ visible: false, text: "" })} />
      <div className="signlog-div">
        {BG_IMAGES.map((src, i) => (
          <div
            key={src}
            className={`signlog-bg-slide${i === bgIndex ? " active" : i === prevBgIndex ? " leaving" : ""}`}
            style={{ backgroundImage: `url(${src})` }}
          />
        ))}
        <div className="signlog-bg-overlay" />
        <div className={`container ${type === "signUp" ? "right-panel-active" : ""}`} id="container">

          {/* ── Signup Form ── */}
          <div className="form-container sign-up-container">
            <form className="form-div" onSubmit={signupOnSubmit}>
              <div className="signup-heading">
                <div className="avatar-uploader">
                  <img src={avatar || "/user-ani.webp"} alt="avatar" className="avatar-img" />
                  <label className="avatar-edit-badge">
                    <EditIcon fontSize="small" />
                    <input type="file" accept="image/*" style={{ display: "none" }}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = () => setAvatar(String(reader.result || ""));
                        reader.readAsDataURL(file);
                      }}
                    />
                  </label>
                </div>
                <h1 className="heading-h1">Create Account</h1>
              </div>

              <div className="form-fields">
                {/* Name */}
                <div className="mb-3">
                  <div className="input-group">
                    <span className="input-group-text icon-badge"><PersonIcon fontSize="small" /></span>
                    <input className="form-control" type="text" value={uname}
                      onChange={(e) => setUname(e.target.value)}
                      placeholder="Full Name" autoComplete="name" required />
                  </div>
                  {validationErrors.uname && <span className="span-tag error-text">{validationErrors.uname}</span>}
                </div>

                {/* Email */}
                <div className="mb-3">
                  <div className="input-group">
                    <span className="input-group-text icon-badge"><EmailIcon fontSize="small" /></span>
                    <input className="form-control" type="email" value={uemail}
                      onChange={(e) => { setUemail(e.target.value); setEmailCheckStatus("idle"); setValidationErrors((p) => ({ ...p, uemail: "" })); }}
                      placeholder="Email Address" autoComplete="email" required />
                    {emailCheckStatus === "checking" && (
                      <span className="input-group-text" style={{ background: "transparent", border: "none" }}>
                        <span className="spinner-border spinner-border-sm text-secondary" role="status" aria-hidden="true" />
                      </span>
                    )}
                    {emailCheckStatus === "available" && (
                      <span className="input-group-text" style={{ background: "transparent", border: "none", color: "#059669", fontWeight: 700 }}>✓</span>
                    )}
                    {emailCheckStatus === "taken" && (
                      <span className="input-group-text" style={{ background: "transparent", border: "none", color: "#dc2626", fontWeight: 700 }}>✗</span>
                    )}
                  </div>
                  {validationErrors.uemail && (
                    <span className="span-tag error-text">
                      {validationErrors.uemail}
                      {validationErrors.uemail.includes("already registered") && (
                        <span
                          onClick={() => toggleSignupLogin("signIn")}
                          style={{ marginLeft: "6px", color: "#ea580c", cursor: "pointer", textDecoration: "underline", fontWeight: 700 }}
                        >
                          Login instead →
                        </span>
                      )}
                    </span>
                  )}
                </div>

                {/* Password */}
                <div className="mb-3">
                  <div className="input-group">
                    <span className="input-group-text icon-badge"><LockIcon fontSize="small" /></span>
                    <input className="form-control" type={showPassword ? "text" : "password"}
                      value={upassword} onChange={(e) => setUpassword(e.target.value)}
                      placeholder="Password" autoComplete="new-password" required />
                    <button type="button" className="btn password-toggle-btn"
                      onClick={() => setShowPassword((v) => !v)} aria-label="Toggle password visibility">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </button>
                  </div>
                  {validationErrors.upassword && <span className="span-tag error-text">{validationErrors.upassword}</span>}
                </div>

                {/* Confirm Password */}
                <div className="mb-3">
                  <div className="input-group">
                    <span className="input-group-text icon-badge"><LockIcon fontSize="small" /></span>
                    <input className="form-control" type={showConfirmPassword ? "text" : "password"}
                      value={uconfirmPassword} onChange={(e) => setUconfirmPassword(e.target.value)}
                      placeholder="Confirm Password" autoComplete="new-password" required />
                    <button type="button" className="btn password-toggle-btn"
                      onClick={() => setShowConfirmPassword((v) => !v)} aria-label="Toggle confirm password visibility">
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </button>
                  </div>
                  {validationErrors.uconfirmPassword && <span className="span-tag error-text">{validationErrors.uconfirmPassword}</span>}
                </div>

                {apiStatus.error && (
                  <span className="span-tag error-text">
                    {apiStatus.error}
                    {(apiStatus.error.includes("already registered") || apiStatus.error.includes("already exists")) && (
                      <span
                        onClick={() => toggleSignupLogin("signIn")}
                        style={{ marginLeft: "6px", color: "#ea580c", cursor: "pointer", textDecoration: "underline", fontWeight: 700 }}
                      >
                        Login instead →
                      </span>
                    )}
                  </span>
                )}
                <span className="span-tag success-text">{apiStatus.success}</span>

                {/* OTP Channel + Send */}
                <div className="input-group mb-1">
                  <select value={channel} className="form-select otp-channel-select"
                    onChange={(e) => { setChannel(e.target.value); setContact(""); setIsOtpSent(false); }}>
                    <option value="email">📧 Email</option>
                    <option value="sms">📱 SMS</option>
                    <option value="whatsapp">💬 WhatsApp</option>
                  </select>
                  {channel === "email" ? (
                    <input className="form-control" type="email" value={uemail}
                      onChange={(e) => { setUemail(e.target.value); setContact(e.target.value); }}
                      placeholder="Email address for OTP" />
                  ) : (
                    <input className="form-control" type="tel" value={contact}
                      onChange={(e) => setContact(e.target.value)}
                      placeholder={channel === "whatsapp" ? "WhatsApp number (+91XXXXXXXXXX)" : "Mobile number (+91XXXXXXXXXX)"} />
                  )}
                  <button type="button" className="btn btn-outline-secondary"
                    onClick={sendOtp}
                    disabled={timer > 0 || isOtpVerified || isOtpSending || emailCheckStatus === "taken"}
                    style={{ minWidth: "110px" }}>
                    {isOtpSending
                      ? <><span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true" />Sending...</>
                      : timer > 0 ? `Resend in ${timer}s` : isOtpVerified ? "✅ Sent" : "Send OTP"}
                  </button>
                </div>

                {/* Resend hint */}
                {isOtpSent && timer === 0 && (
                  <div style={{ textAlign: "right", marginBottom: "8px" }}>
                    <span onClick={sendOtp} style={{ fontSize: "0.75rem", color: "var(--primary)", cursor: "pointer", textDecoration: "underline", fontWeight: 600 }}>
                      Resend OTP
                    </span>
                  </div>
                )}
                {validationErrors.contact && <span className="span-tag error-text">{validationErrors.contact}</span>}

                {/* OTP Input + Verify */}
                {isOtpSent && (
                  <div className="input-group mb-2">
                    <span className="input-group-text bg-light border-secondary">OTP</span>
                    <input ref={otpInputRef} className="form-control" type="text"
                      inputMode="numeric" maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                      onPaste={(e) => {
                        e.preventDefault();
                        setOtpCode(e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6));
                      }}
                      placeholder="Enter 6-digit OTP" />
                    <button type="button" className="btn btn-success"
                      onClick={verifyOtp}
                      disabled={isOtpVerifying || otpCode.length !== 6}
                      style={{ minWidth: "110px" }}>
                      {isOtpVerifying
                        ? <><span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true" />Verifying...</>
                        : "Verify OTP"}
                    </button>
                  </div>
                )}

                {/* OTP status message */}
                {(otpMsg || isOtpVerified) && (
                  <span className={`span-tag ${isOtpVerified ? "success-text" : "error-text"}`}>
                    {isOtpVerified ? "✅ OTP Verified Successfully" : otpMsg}
                  </span>
                )}

                {/* Sign Up button */}
                <button className="codepen-button" type="submit"
                  disabled={isLoading || !isOtpVerified}
                  style={{ opacity: !isOtpVerified ? 0.6 : 1, cursor: !isOtpVerified ? "not-allowed" : "pointer" }}>
                  {isLoading
                    ? <><span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true" />Creating account...</>
                    : "Sign Up"}
                </button>

                <div style={{ fontSize: "0.72rem", color: "#888", marginTop: "8px", textAlign: "center", fontStyle: "italic" }}>
                  First request may take ~30s on free hosting (Render cold start)
                </div>

                {/* OAuth */}
                <div className="auth-social-row" style={{ marginTop: "0.75rem" }}>
                  <button type="button" className="codepen-button"
                    onClick={() => (window.location.href = `${API_URL}/api/oauth/google`)}>
                    <span className="btn-icon"><GoogleIcon fontSize="small" /></span> Continue with Google
                  </button>
                  <button type="button" className="codepen-button"
                    onClick={() => (window.location.href = `${API_URL}/api/oauth/github`)}>
                    <span className="btn-icon"><GitHubIcon fontSize="small" /></span> Continue with GitHub
                  </button>
                </div>

                <div className="mobile-toggle">
                  Already have an account? <span onClick={() => toggleSignupLogin("signIn")}>Login</span>
                </div>
              </div>
            </form>
          </div>

          {/* ── Login Form ── */}
          {type === "signIn" && (
            <div className="form-container sign-in-container">
              <Login toggleMobile={() => toggleSignupLogin("signUp")} />
            </div>
          )}

          {/* ── Overlay panels ── */}
          <div className="overlay-container">
            <div className="overlay">
              <div className="overlay-panel overlay-left">
                <h1>Welcome Back!</h1>
                <p className="description">To keep connected with us please login with your personal info</p>
                <button className="Btn" onClick={() => toggleSignupLogin("signIn")}>Login</button>
              </div>
              <div className="overlay-panel overlay-right">
                <h1>New User? Please login here</h1>
                <p className="description">Enter your personal details and start your journey with us</p>
                <button className="Btn2" onClick={() => toggleSignupLogin("signUp")}>Sign Up</button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}

export default Signup;
