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
import EditIcon from "@mui/icons-material/Edit";
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
  const [avatar, setAvatar] = useState("");
  const navigate = useNavigate();

  const API_URL = (
    import.meta.env.VITE_API_URL || "http://localhost:1111"
  ).replace(/\/$/, "");

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
        { uname, uemail, upassword, avatar },
      );

      if (res.status === 200) {
        setApiStatus({
          error: "",
          success: "Registration successful! You can now log in.",
        });
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
        { withCredentials: true, headers: { "x-csrf-token": csrf?.csrfToken } },
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
        { withCredentials: true, headers: { "x-csrf-token": csrf?.csrfToken } },
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
              <div className="avatar-uploader">
                <img
                  src={avatar || "/footer-images/user-icon.png"}
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
              <div className="input-group mb-3">
                <span className="input-group-text icon-badge">
                  <PersonIcon fontSize="small" />
                </span>
                <input
                  className="form-control"
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

              <div className="input-group mb-3">
                <span className="input-group-text icon-badge">
                  <EmailIcon fontSize="small" />
                </span>
                <input
                  className="form-control"
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

              <div className="input-group mb-3">
                <span className="input-group-text icon-badge">
                  <LockIcon fontSize="small" />
                </span>
                <input
                  className="form-control"
                  type={showPassword ? "text" : "password"}
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
                <span className="span-tag error-text">
                  {validationErrors.upassword}
                </span>
              </div>

              <div className="input-group mb-3">
                <span className="input-group-text icon-badge">
                  <LockIcon fontSize="small" />
                </span>
                <input
                  className="form-control"
                  type={showConfirmPassword ? "text" : "password"}
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
                <span className="span-tag error-text">
                  {validationErrors.uconfirmPassword}
                </span>
              </div>

              <span className="span-tag error-text">{apiStatus.error}</span>
              <span className="span-tag success-text">{apiStatus.success}</span>
              <div className="input-group mb-3">
                <input
                  className="form-control"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Phone for OTP"
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={isOtpSent ? verifyOtp : sendOtp}
                >
                  {isOtpSent ? "Verify OTP" : "Send OTP"}
                </button>
              </div>
              {isOtpSent && (
                <div className="input-group mb-3">
                  <span className="input-group-text bg-light border-secondary">
                    OTP
                  </span>
                  <input
                    className="form-control"
                    type="text"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="Enter OTP"
                  />
                </div>
              )}
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
