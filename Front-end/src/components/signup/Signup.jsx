import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../signup/Signup.css";
import Login from "../login/Login";
import axios from "axios";
import { signupSchema } from "../../validations/schemas";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle, faGithub } from "@fortawesome/free-brands-svg-icons";

function Signup() {
  const [type, setType] = useState("signUp");
  const [validationErrors, setValidationErrors] = useState({});
  const [apiStatus, setApiStatus] = useState({ error: "", success: "" });

  const [uname, setUname] = useState("");
  const [uemail, setUemail] = useState("");
  const [upassword, setUpassword] = useState("");
  const [uconfirmPassword, setUconfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [phone, setPhone] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpMsg, setOtpMsg] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:1111";

  const toggleSignupLogin = (text) => {
    if (text !== type) {
      setType(text);
      setValidationErrors({});
      setApiStatus({ error: "", success: "" });
    }
  };

  const signupOnSubmit = async (e) => {
    e.preventDefault();
    setValidationErrors({});
    setApiStatus({ error: "", success: "" });

    // Client-side Confirm Password Check
    if (upassword !== uconfirmPassword) {
      setValidationErrors({ uconfirmPassword: "Passwords do not match." });
      return;
    }

    // Zod Validation
    const result = signupSchema.safeParse({ uname, uemail, upassword });
    if (!result.success) {
      const errors = {};
      result.error.issues.forEach((err) => {
        errors[err.path[0]] = err.message;
      });
      setValidationErrors(errors);
      return;
    }

    try {
      const res = await axios.post(
        `${API_URL}/api/signupLoginRouter/registerUser`,
        { uname, uemail, upassword }
      );

      if (res.status === 200) {
        setApiStatus({
          error: "",
          success: "Registration successful! You can now log in.",
        });
        setTimeout(() => toggleSignupLogin("signIn"), 2000);
      }
    } catch (err) {
      setApiStatus({
        error:
          err.response?.data?.Message ||
          "An error occurred during registration.",
        success: "",
      });
    }
  };
  const sendOtp = async () => {
    setOtpMsg("");
    try {
      const csrf = await fetch(`${API_URL}/api/csrf`, {
        credentials: "include",
      })
        .then((r) => r.json())
        .catch(() => ({}));
      const res = await axios.post(
        `${API_URL}/api/otp/send`,
        { to: phone, channel: "sms" },
        { withCredentials: true, headers: { "x-csrf-token": csrf?.csrfToken } }
      );
      if (res.status === 200) {
        setOtpMsg("OTP sent");
        setIsOtpSent(true);
      }
    } catch {
      setOtpMsg("Failed to send OTP");
    }
  };
  const verifyOtp = async () => {
    setOtpMsg("");
    try {
      const csrf = await fetch(`${API_URL}/api/csrf`, {
        credentials: "include",
      })
        .then((r) => r.json())
        .catch(() => ({}));
      const res = await axios.post(
        `${API_URL}/api/otp/verify`,
        { to: phone, code: otpCode },
        { withCredentials: true, headers: { "x-csrf-token": csrf?.csrfToken } }
      );
      if (res.data?.ok) {
        setOtpMsg("OTP verified");
        setIsOtpSent(false);
        setOtpCode("");
      } else setOtpMsg("Invalid OTP");
    } catch {
      setOtpMsg("Failed to verify OTP");
    }
  };

  return (
    <div className="signlog-div">
      <div
        className={`container ${type === "signUp" ? "right-panel-active" : ""}`}
        id="container"
      >
        <div className="form-container sign-up-container">
          <form className="form-div" onSubmit={signupOnSubmit}>
            <div className="signup-heading">
              <img
                src="/footer-images/user-icon.png"
                alt="Create Account"
                className="auth-illustration"
              />
              <h1 className="heading-h1">Create Account</h1>
              <p className="description">Enter your details to get started</p>
            </div>
            <div className="input-group input-icon-wrapper">
              <span className="input-icon">
                <PersonIcon />
              </span>
              <input
                className="text-input with-icon"
                type="text"
                value={uname}
                onChange={(e) => setUname(e.target.value)}
                placeholder="Full Name"
                autoComplete="name"
                required
              />
              <span className="span-tag error-text">
                {validationErrors.uname}
              </span>
            </div>

            <div className="input-group input-icon-wrapper">
              <span className="input-icon">
                <EmailIcon />
              </span>
              <input
                className="text-input with-icon"
                type="email"
                value={uemail}
                onChange={(e) => setUemail(e.target.value)}
                placeholder="Email Address"
                autoComplete="email"
                required
              />
              <span className="span-tag error-text">
                {validationErrors.uemail}
              </span>
            </div>

            <div className="input-group input-icon-wrapper">
              <span className="input-icon">
                <LockIcon />
              </span>
              <div className="password-wrapper">
                <input
                  className="text-input with-icon"
                  type={showPassword ? "text" : "password"}
                  value={upassword}
                  onChange={(e) => setUpassword(e.target.value)}
                  placeholder="Password"
                  autoComplete="new-password"
                  required
                />
                <span
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </span>
              </div>
              <span className="span-tag error-text">
                {validationErrors.upassword}
              </span>
            </div>

            <div className="input-group input-icon-wrapper">
              <span className="input-icon">
                <LockIcon />
              </span>
              <div className="password-wrapper">
                <input
                  className="text-input with-icon"
                  type={showConfirmPassword ? "text" : "password"}
                  value={uconfirmPassword}
                  onChange={(e) => setUconfirmPassword(e.target.value)}
                  placeholder="Confirm Password"
                  autoComplete="new-password"
                  required
                />
                <span
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                </span>
              </div>
              <span className="span-tag error-text">
                {validationErrors.uconfirmPassword}
              </span>
            </div>

            <span className="span-tag error-text">{apiStatus.error}</span>
            <span className="span-tag success-text">{apiStatus.success}</span>
            <div className="otp-inline-row">
              <input
                className="text-input with-icon"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone for OTP"
              />
              {isOtpSent && (
                <input
                  className="text-input"
                  type="text"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="Enter OTP"
                />
              )}
              <button
                type="button"
                className="codepen-button"
                onClick={isOtpSent ? verifyOtp : sendOtp}
              >
                {isOtpSent ? "Verify OTP" : "Send OTP"}
              </button>
            </div>
            <span className="span-tag success-text">{otpMsg}</span>
            <button className="codepen-button" type="submit">
              Sign Up
            </button>
            <div className="auth-social-row" style={{ marginTop: "0.75rem" }}>
              <button
                type="button"
                className="codepen-button"
                onClick={() =>
                  (window.location.href = `${API_URL}/api/oauth/google`)
                }
              >
                <span className="btn-icon">
                  <FontAwesomeIcon icon={faGoogle} />
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
                  <FontAwesomeIcon icon={faGithub} />
                </span>{" "}
                Continue with GitHub
              </button>
            </div>

            <div className="mobile-toggle">
              Already have an account?{" "}
              <span onClick={() => toggleSignupLogin("signIn")}>Login</span>
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
  );
}

export default Signup;
