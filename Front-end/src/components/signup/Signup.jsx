import React, { useState, useEffect } from "react";
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

const BG_IMAGES = [
  "/dark1.jpg",
  "/dark2.jpg",
  "/dark3.jpg",
];

function Signup() {
  const [type, setType] = useState("signUp");
  const [validationErrors, setValidationErrors] = useState({});
  const [apiStatus, setApiStatus] = useState({ error: "", success: "" });
  const [isLoading, setIsLoading] = useState(false);

  const [uname, setUname] = useState("");
  const [uemail, setUemail] = useState("");
  const [upassword, setUpassword] = useState("");
  const [uconfirmPassword, setUconfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [contact, setContact] = useState("");
  const [channel, setChannel] = useState("email");
  const [otpCode, setOtpCode] = useState("");
  const [otpMsg, setOtpMsg] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isOtpSending, setIsOtpSending] = useState(false);
  const [isOtpVerifying, setIsOtpVerifying] = useState(false);
  const [avatar, setAvatar] = useState("");
  const [popup, setPopup] = useState({ visible: false, text: "" });
  const [bgIndex, setBgIndex] = useState(0);
  const [prevBgIndex, setPrevBgIndex] = useState(null);
  const navigate = useNavigate();

  // Slideshow: advance every 6 seconds to match the slow zoom
  useEffect(() => {
    const id = setInterval(() => {
      setBgIndex((i) => {
        setPrevBgIndex(i);
        return (i + 1) % BG_IMAGES.length;
      });
    }, 6000);
    return () => clearInterval(id);
  }, []);

  const showPopup = (msg) => {
    setPopup({ visible: true, text: msg });
    setTimeout(() => setPopup({ visible: false, text: "" }), 3000);
  };

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const API_URL = (
    import.meta.env.VITE_API_URL || "http://localhost:1111"
  ).replace(/\/$/, "");

  const toggleSignupLogin = (text) => {
    if (text !== type) {
      setType(text);
      setValidationErrors({});
      setApiStatus({ error: "", success: "" });
      setIsOtpVerified(false);
      setIsOtpSent(false);
      setOtpMsg("");
    }
  };

  // Pre-warm the server on component mount to reduce spin-up delay
  React.useEffect(() => {
    const pingServer = async () => {
      try {
        await fetch(`${API_URL}/health`);
      } catch (err) {
        // Silently fail, just intended to wake up the server
      }
    };
    pingServer();
  }, [API_URL]);

  // keep contact synced when using email channel
  React.useEffect(() => {
    if (channel === "email") {
      setContact(uemail);
    }
  }, [channel, uemail]);

  const signupOnSubmit = async (e) => {
    e.preventDefault();
    setValidationErrors({});
    setApiStatus({ error: "", success: "" });

    // Enforce OTP Verification
    if (!isOtpVerified) {
      setApiStatus({ error: "Please verify your OTP before signing up.", success: "" });
      toast.error("Please verify your OTP before signing up.");
      return;
    }

    // Client-side Confirm Password Check
    if (upassword !== uconfirmPassword) {
      setValidationErrors({ uconfirmPassword: "Passwords do not match." });
      return;
    }

    // Yup Validation
    try {
      await signupSchema.validate({ uname, uemail, upassword }, { abortEarly: false });
    } catch (err) {
      const errors = {};
      err.inner.forEach((e) => {
        errors[e.path] = e.message;
      });
      setValidationErrors(errors);
      return;
    }

    setIsLoading(true);
    const toastId = toast.loading("Registering your account... Please wait.");

    try {
      const res = await axios.post(
        `${API_URL}/api/signupLoginRouter/registerUser`,
        { uname, uemail, upassword, avatar },
      );

      if (res.status === 200) {
        toast.update(toastId, {
          render: "Registration successful! You can now log in.",
          type: "success",
          isLoading: false,
          autoClose: 3000
        });
        setApiStatus({
          error: "",
          success: "Registration successful! You can now log in.",
        });
        // clear form fields
        setUname("");
        setUemail("");
        setUpassword("");
        setUconfirmPassword("");
        setContact("");
        setAvatar("");
        setOtpCode("");
        setOtpMsg("");
        setIsOtpSent(false);
        setChannel("email");
        setValidationErrors({});
        // switch to login after delay
        setTimeout(() => toggleSignupLogin("signIn"), 2000);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.Message || err.response?.data?.Error || "Registration failed.";
      toast.update(toastId, {
        render: errorMsg,
        type: "error",
        isLoading: false,
        autoClose: 3000
      });
      if (err.response?.status === 403 || err.response?.status === 400) {
        setApiStatus({
          error: errorMsg,
          success: "",
        });
      } else {
        setApiStatus({
          error: "An unexpected error occurred during registration.",
          success: "",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  /* OLD LOGIC WRAPPED IN COMMENTS AS REQUESTED
  const signupOnSubmit = async (e) => {
    e.preventDefault();
    setValidationErrors({});
    setApiStatus({ error: "", success: "" });

    // Client-side Confirm Password Check
    if (upassword !== uconfirmPassword) {
      setValidationErrors({ uconfirmPassword: "Passwords do not match." });
      return;
    }

    // Yup Validation
    try {
      await signupSchema.validate({ uname, uemail, upassword }, { abortEarly: false });
    } catch (err) {
      const errors = {};
      err.inner.forEach((e) => {
        errors[e.path] = e.message;
      });
      setValidationErrors(errors);
      return;
    }

    try {
      const res = await axios.post(
        `${API_URL}/api/signupLoginRouter/registerUser`,
        { uname, uemail, upassword, avatar },
      );

      if (res.status === 200) {
        setApiStatus({
          error: "",
          success: "Registration successful! You can now log in.",
        });
        // clear form fields
        setUname("");
        setUemail("");
        setUpassword("");
        setUconfirmPassword("");
        setContact("");
        setAvatar("");
        setOtpCode("");
        setOtpMsg("");
        setIsOtpSent(false);
        setChannel("email");
        setValidationErrors({});
        // switch to login after delay
        setTimeout(() => toggleSignupLogin("signIn"), 2000);
      }
    } catch (err) {
      if (err.response?.status === 403 || err.response?.status === 400) {
        // Suppress console error for expected validation failures
        setApiStatus({
          error:
            err.response?.data?.Message ||
            err.response?.data?.Error ||
            "An error occurred during registration.",
          success: "",
        });
      } else {
        setApiStatus({
          error: "An unexpected error occurred during registration.",
          success: "",
        });
      }
    }
  };
  */
  const sendOtp = async () => {
    setValidationErrors({});
    setOtpMsg("");

    // Validate initial fields before sending OTP
    const errors = {};
    if (!uname) errors.uname = "Name is required.";
    if (!uemail) errors.uemail = "Email is required.";
    if (!upassword) errors.upassword = "Password is required.";
    if (upassword !== uconfirmPassword) errors.uconfirmPassword = "Passwords do not match.";
    if (!contact) errors.contact = `Please enter your ${channel} for OTP.`;

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      toast.error("Please fill all required fields correctly before sending OTP.");
      return;
    }

    setIsOtpSending(true);
    const toastId = toast.loading("Sending OTP... This may take a moment on first request.");

    try {
      const csrf = await fetch(`${API_URL}/api/csrf`, {
        credentials: "include",
      })
        .then((r) => r.json())
        .catch(() => ({}));
      const payload = { contact, channel };
      const res = await axios.post(`${API_URL}/api/otp/send`, payload, {
        withCredentials: true,
        headers: { "x-csrf-token": csrf?.csrfToken },
      });
      if (res.status === 200) {
        const channelLabel = channel === "email" ? `email (${contact})` : channel === "sms" ? `SMS to ${contact}` : `WhatsApp to ${contact}`;
        const channelIcon = channel === "email" ? "📧" : channel === "sms" ? "📱" : "💬";
        setOtpMsg(`OTP sent via ${channel} to ${contact}`);
        setIsOtpSent(true);
        setTimer(60);
        toast.update(toastId, {
          render: `${channelIcon} OTP sent via ${channelLabel}! Check and enter below.`,
          type: "success",
          isLoading: false,
          autoClose: 5000,
        });
        showPopup(`${channelIcon} OTP sent to your ${channel === "email" ? "email inbox" : channel === "sms" ? "phone via SMS" : "WhatsApp"}`);
      }
    } catch {
      setOtpMsg("Failed to send OTP");
      toast.update(toastId, {
        render: "Failed to send OTP. Please check your details and try again.",
        type: "error",
        isLoading: false,
        autoClose: 4000,
      });
    } finally {
      setIsOtpSending(false);
    }
  };
  const verifyOtp = async () => {
    setOtpMsg("");
    setIsOtpVerifying(true);
    const toastId = toast.loading("Verifying OTP...");
    try {
      const csrf = await fetch(`${API_URL}/api/csrf`, {
        credentials: "include",
      })
        .then((r) => r.json())
        .catch(() => ({}));
      const res = await axios.post(
        `${API_URL}/api/otp/verify`,
        { contact: contact, code: otpCode.replace(/\s/g, "") },
        { withCredentials: true, headers: { "x-csrf-token": csrf?.csrfToken } },
      );
      if (res.data?.ok) {
        setOtpMsg("OTP verified");
        setIsOtpSent(false);
        setIsOtpVerified(true);
        setOtpCode("");
        toast.update(toastId, { render: "✅ OTP verified successfully!", type: "success", isLoading: false, autoClose: 3000 });
        showPopup("OTP verified successfully!");
      } else {
        setOtpMsg("Invalid or Expired OTP");
        toast.update(toastId, { render: "Invalid or expired OTP. Please try again.", type: "error", isLoading: false, autoClose: 4000 });
        showPopup("The OTP you entered is incorrect or has expired.");
      }
    } catch {
      setOtpMsg("Failed to verify OTP");
      toast.update(toastId, { render: "Failed to verify OTP. Please try again.", type: "error", isLoading: false, autoClose: 4000 });
    } finally {
      setIsOtpVerifying(false);
    }
  };

  return (
    <>
      {/* Premium popup alert with slide animation */}
      <PopupAlert
        visible={popup.visible}
        text={popup.text}
        onClose={() => setPopup({ visible: false, text: "" })}
      />
      <div className="signlog-div">
        {/* Background slideshow */}
        {BG_IMAGES.map((src, i) => (
          <div
            key={src}
            className={`signlog-bg-slide${i === bgIndex ? " active" : i === prevBgIndex ? " leaving" : ""}`}
            style={{ backgroundImage: `url(${src})` }}
          />
        ))}
        <div className="signlog-bg-overlay" />
        <div
          className={`container ${type === "signUp" ? "right-panel-active" : ""}`}
          id="container"
        >
          <div className="form-container sign-up-container">
            <form className="form-div" onSubmit={signupOnSubmit}>
              <div className="signup-heading">
                <div className="avatar-uploader">
                  <img
                    src={avatar || "/user-ani.webp"}
                    alt="avatar"
                    className="avatar-img"
                  />
                  <label className="avatar-edit-badge">
                    <EditIcon fontSize="small" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = () =>
                          setAvatar(String(reader.result || ""));
                        reader.readAsDataURL(file);
                      }}
                      style={{ display: "none" }}
                    />
                  </label>
                </div>
                <h1 className="heading-h1">Create Account</h1>
              </div>
              <div className="form-fields">
                <div className="mb-3">
                  <div className="input-group">
                    <span className="input-group-text icon-badge">
                      <PersonIcon fontSize="small" />
                    </span>
                    <input
                      className="form-control"
                      type="text"
                      id="signup-uname"
                      value={uname}
                      onChange={(e) => setUname(e.target.value)}
                      placeholder="Full Name"
                      autoComplete="name"
                      required
                    />
                  </div>
                  {validationErrors.uname && (
                    <span className="span-tag error-text">
                      {validationErrors.uname}
                    </span>
                  )}
                </div>

                <div className="mb-3">
                  <div className="input-group">
                    <span className="input-group-text icon-badge">
                      <EmailIcon fontSize="small" />
                    </span>
                    <input
                      className="form-control"
                      type="email"
                      id="signup-email"
                      value={uemail}
                      onChange={(e) => setUemail(e.target.value)}
                      placeholder="Email Address"
                      autoComplete="email"
                      required
                    />
                  </div>
                  {validationErrors.uemail && (
                    <span className="span-tag error-text">
                      {validationErrors.uemail}
                    </span>
                  )}
                </div>

                <div className="mb-3">
                  <div className="input-group">
                    <span className="input-group-text icon-badge">
                      <LockIcon fontSize="small" />
                    </span>
                    <input
                      className="form-control"
                      type={showPassword ? "text" : "password"}
                      id="signup-password"
                      value={upassword}
                      onChange={(e) => setUpassword(e.target.value)}
                      placeholder="Password"
                      autoComplete="new-password"
                      required
                    />
                    <button
                      type="button"
                      className="btn password-toggle-btn"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </button>
                  </div>
                  {validationErrors.upassword && (
                    <span className="span-tag error-text">
                      {validationErrors.upassword}
                    </span>
                  )}
                </div>

                <div className="mb-3">
                  <div className="input-group">
                    <span className="input-group-text icon-badge">
                      <LockIcon fontSize="small" />
                    </span>
                    <input
                      className="form-control"
                      type={showConfirmPassword ? "text" : "password"}
                      id="signup-confirm-password"
                      value={uconfirmPassword}
                      onChange={(e) => setUconfirmPassword(e.target.value)}
                      placeholder="Confirm Password"
                      autoComplete="new-password"
                      required
                    />
                    <button
                      type="button"
                      className="btn password-toggle-btn"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label="Toggle confirm password visibility"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </button>
                  </div>
                  {validationErrors.uconfirmPassword && (
                    <span className="span-tag error-text">
                      {validationErrors.uconfirmPassword}
                    </span>
                  )}
                </div>

                <span className="span-tag error-text">{apiStatus.error}</span>
                <span className="span-tag success-text">
                  {apiStatus.success}
                </span>
                <div className="input-group mb-3">
                  <select
                    value={channel}
                    onChange={(e) => {
                      setChannel(e.target.value);
                      setContact("");
                    }}
                    className="form-select otp-channel-select"
                  >
                    <option value="email">📧 Email</option>
                    <option value="sms">📱 SMS</option>
                    <option value="whatsapp">💬 WhatsApp</option>
                  </select>
                  {channel === "email" ? (
                    <input
                      className="form-control"
                      type="email"
                      value={uemail}
                      onChange={(e) => {
                        setUemail(e.target.value);
                        setContact(e.target.value);
                      }}
                      placeholder="Email address for OTP"
                    />
                  ) : (
                    <input
                      className="form-control"
                      type="tel"
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                      placeholder={channel === "whatsapp" ? "WhatsApp number (e.g. +91XXXXXXXXXX)" : "Mobile number (e.g. +91XXXXXXXXXX)"}
                    />
                  )}
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={sendOtp}
                    disabled={timer > 0 || isOtpVerified || isOtpSending}
                    style={{ minWidth: "110px" }}
                  >
                    {isOtpSending ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true" />
                        Sending...
                      </>
                    ) : timer > 0 ? `Resend in ${timer}s` : "Send OTP"}
                  </button>
                </div>
                {isOtpSent && timer > 0 && (
                  <div style={{ fontSize: "0.75rem", color: "var(--primary)", marginTop: "-10px", marginBottom: "10px", textAlign: "right" }}>
                    Resend available in {timer}s
                  </div>
                )}
                {isOtpSent && timer === 0 && (
                  <div style={{ textAlign: "right", marginTop: "-10px", marginBottom: "10px" }}>
                    <span
                      onClick={sendOtp}
                      style={{ fontSize: "0.75rem", color: "var(--primary)", cursor: "pointer", textDecoration: "underline", fontWeight: "bold" }}
                    >
                      Resend OTP
                    </span>
                  </div>
                )}
                {validationErrors.contact && (
                  <span className="span-tag error-text">
                    {validationErrors.contact}
                  </span>
                )}
                {isOtpSent && (
                  <div className="input-group mb-3">
                    <span className="input-group-text bg-light border-secondary">
                      OTP
                    </span>
                    <input
                      className="form-control"
                      type="text"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\s/g, ""))}
                      placeholder="Enter OTP"
                    />
                    <button
                      type="button"
                      className="btn btn-success"
                      onClick={verifyOtp}
                      disabled={isOtpVerifying || !otpCode}
                      style={{ minWidth: "110px" }}
                    >
                      {isOtpVerifying ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true" />
                          Verifying...
                        </>
                      ) : "Verify OTP"}
                    </button>
                  </div>
                )}
                <span className="span-tag success-text">
                  {isOtpVerified ? "✅ OTP Verified Successfully" : otpMsg}
                </span>
                <button
                  className="codepen-button"
                  type="submit"
                  disabled={isLoading || !isOtpVerified}
                  style={{ opacity: (!isOtpVerified && !isLoading) ? 0.6 : 1, cursor: (!isOtpVerified && !isLoading) ? "not-allowed" : "pointer" }}
                >
                  {isLoading ? "Processing..." : "Sign Up"}
                </button>

                {/* Server spin-up notice */}
                <div style={{
                  fontSize: "0.75rem",
                  color: "#666",
                  marginTop: "10px",
                  textAlign: "center",
                  fontStyle: "italic"
                }}>
                  Note: Initial request may take 30-60 seconds due to server wake-up time on free hosting.
                </div>

                <div
                  className="auth-social-row"
                  style={{ marginTop: "0.75rem" }}
                >
                  <button
                    type="button"
                    className="codepen-button"
                    onClick={() =>
                      (window.location.href = `${API_URL}/api/oauth/google`)
                    }
                  >
                    <span className="btn-icon">
                      <GoogleIcon fontSize="small" />
                    </span>{" "}
                    Continue with Google
                  </button>
                  <button
                    type="button"
                    className="codepen-button"
                    onClick={() =>
                      (window.location.href = `${API_URL}/api/oauth/github`)
                    }
                  >
                    <span className="btn-icon">
                      <GitHubIcon fontSize="small" />
                    </span>{" "}
                    Continue with GitHub
                  </button>
                </div>

                <div className="mobile-toggle">
                  Already have an account?{" "}
                  <span onClick={() => toggleSignupLogin("signIn")}>Login</span>
                </div>
              </div>
            </form>
          </div>

          {type === "signIn" && (
            <div className="form-container sign-in-container">
              <Login toggleMobile={() => toggleSignupLogin("signUp")} />
            </div>
          )}

          <div className="overlay-container">
            <div className="overlay">
              <div className="overlay-panel overlay-left">
                <h1>Welcome Back!</h1>
                <p className="description">
                  To keep connected with us please login with your personal info
                </p>
                <button
                  className="Btn"
                  onClick={() => toggleSignupLogin("signIn")}
                >
                  Login
                </button>
              </div>
              <div className="overlay-panel overlay-right">
                <h1>New User? Please login here</h1>
                <p className="description">
                  Enter your personal details and start your journey with us
                </p>
                <button
                  className="Btn2"
                  onClick={() => toggleSignupLogin("signUp")}
                >
                  Sign Up
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Signup;
