import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../signup/Signup.css";
import axios from "axios";
import { loginSchema } from "../../validations/schemas";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle, faGithub } from "@fortawesome/free-brands-svg-icons";

function SignInForm({ toggleMobile }) {
  const [validationErrors, setValidationErrors] = useState({});
  const [apiError, setApiError] = useState("");

  const [uemail, setUemail] = useState("");
  const [upassword, setUpassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:1111";

  const loginOnSubmit = async (e) => {
    e.preventDefault();
    setValidationErrors({});
    setApiError("");

    // Zod Validation
    const result = loginSchema.safeParse({ uemail, upassword });
    if (!result.success) {
      const errors = {};
      result.error.issues.forEach((err) => {
        errors[err.path[0]] = err.message;
      });
      setValidationErrors(errors);
      return;
    }

    try {
      const csrfRes = await fetch(`${API_BASE_URL}/api/csrf`, {
        credentials: "include",
      });
      const { csrfToken } = (await csrfRes.json()) || {};
      const res = await axios.post(
        `${API_BASE_URL}/api/auth/login`,
        { uemail, upassword },
        { withCredentials: true, headers: { "x-csrf-token": csrfToken } }
      );
      if (res.status === 200) {
        try {
          const meRes = await fetch(`${API_BASE_URL}/api/auth/me`, {
            credentials: "include",
          });
          if (meRes.ok) {
            const me = await meRes.json();
            if (me?.uname) localStorage.setItem("userName", me.uname);
          }
        } catch {}
        navigate("/home");
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.Message ||
        "Invalid email or password.";
      setApiError(msg);
    }
  };

  return (
    <form className="form-div" onSubmit={loginOnSubmit}>
      <div className="login-heading">
        <img
          src="/footer-images/user-icon.png"
          alt="profile"
          className="auth-illustration"
          style={{ borderRadius: "50%" }}
        />
        <h1 className="heading-h1">Welcome Back</h1>
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
        <span className="span-tag error-text">{validationErrors.uemail}</span>
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
            autoComplete="current-password"
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

      <span className="span-tag error-text">{apiError}</span>

      <button className="codepen-button" type="submit">
        Login
      </button>
      <div className="auth-social-row" style={{ marginTop: "0.75rem" }}>
        <button
          type="button"
          className="codepen-button"
          onClick={() =>
            (window.location.href = `${API_BASE_URL}/api/oauth/google`)
          }
        >
          <span className="btn-icon">
            <FontAwesomeIcon icon={faGoogle} />
          </span>{" "}
          Login with Google
        </button>
        <button
          type="button"
          className="codepen-button"
          onClick={() =>
            (window.location.href = `${API_BASE_URL}/api/oauth/github`)
          }
        >
          <span className="btn-icon">
            <FontAwesomeIcon icon={faGithub} />
          </span>{" "}
          Login with GitHub
        </button>
      </div>

      <div className="mobile-toggle">
        Don't have an account? <span onClick={toggleMobile}>Sign Up</span>
      </div>
    </form>
  );
}

export default SignInForm;
