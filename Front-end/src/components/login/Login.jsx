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

function SignInForm({ toggleMobile }) {
  const [validationErrors, setValidationErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [uemail, setUemail] = useState("");
  const [upassword, setUpassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const API_BASE_URL = (
    import.meta.env.VITE_API_URL || "http://localhost:1111"
  ).replace(/\/$/, "");

  const loginOnSubmit = async (e) => {
    e.preventDefault();
    setValidationErrors({});
    setApiError("");

    // Yup Validation
    try {
      await loginSchema.validate({ uemail, upassword }, { abortEarly: false });
    } catch (err) {
      const errors = {};
      err.inner.forEach((e) => {
        errors[e.path] = e.message;
      });
      setValidationErrors(errors);
      return;
    }

    setIsLoading(true);
    const toastId = toast.loading("Logging in... Please wait for server wake-up.");

    try {
      const csrfRes = await fetch(`${API_BASE_URL}/api/csrf`, {
        credentials: "include",
      });
      const { csrfToken } = (await csrfRes.json()) || {};
      const res = await axios.post(
        `${API_BASE_URL}/api/auth/login`,
        { uemail, upassword },
        { withCredentials: true, headers: { "x-csrf-token": csrfToken } },
      );
      if (res.status === 200) {
        toast.update(toastId, { 
          render: "Login successful!", 
          type: "success", 
          isLoading: false,
          autoClose: 2000 
        });

        // Use user info from login response instead of making another call
        const user = res.data?.user;
        if (user) {
          if (user.uname) localStorage.setItem("userName", user.uname);
          if (user.avatar) localStorage.setItem("userAvatar", user.avatar);
        }
        
        navigate("/home");
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.Message ||
        "Invalid email or password.";
      toast.update(toastId, { 
        render: msg, 
        type: "error", 
        isLoading: false,
        autoClose: 3000 
      });
      setApiError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  /* OLD LOGIC WRAPPED IN COMMENTS AS REQUESTED
  const loginOnSubmit = async (e) => {
    e.preventDefault();
    setValidationErrors({});
    setApiError("");

    // Yup Validation
    try {
      await loginSchema.validate({ uemail, upassword }, { abortEarly: false });
    } catch (err) {
      const errors = {};
      err.inner.forEach((e) => {
        errors[e.path] = e.message;
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
        { withCredentials: true, headers: { "x-csrf-token": csrfToken } },
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
  */

  return (
    <form className="form-div" onSubmit={loginOnSubmit}>
      <div className="login-heading">
        <img
          src="/user-ani.webp"
          alt="profile"
          className="auth-illustration"
          style={{ borderRadius: "50%" }}
        />
        <h1 className="heading-h1">Welcome Back</h1>
      </div>
      <div className="input-group mb-3">
        <span className="input-group-text bg-light border-secondary">
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
      </div>
      <span className="span-tag error-text">{validationErrors.uemail}</span>

      <div className="input-group mb-3">
        <span className="input-group-text bg-light border-secondary">
          <LockIcon fontSize="small" />
        </span>
        <input
          className="form-control"
          type={showPassword ? "text" : "password"}
          value={upassword}
          onChange={(e) => setUpassword(e.target.value)}
          placeholder="Password"
          autoComplete="current-password"
          required
        />
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={() => setShowPassword(!showPassword)}
          aria-label="Toggle password visibility"
        >
          {showPassword ? <VisibilityOff /> : <Visibility />}
        </button>
      </div>
      <span className="span-tag error-text">{validationErrors.upassword}</span>

      <span className="span-tag error-text">{apiError}</span>

      <button 
        className="codepen-button" 
        type="submit"
        disabled={isLoading}
      >
        {isLoading ? "Processing..." : "Login"}
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

      <div className="auth-social-row" style={{ marginTop: "0.75rem" }}>
        <button
          type="button"
          className="codepen-button"
          onClick={() =>
            (window.location.href = `${API_BASE_URL}/api/oauth/google`)
          }
        >
          <span className="btn-icon">
            <GoogleIcon fontSize="small" />
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
            <GitHubIcon fontSize="small" />
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
