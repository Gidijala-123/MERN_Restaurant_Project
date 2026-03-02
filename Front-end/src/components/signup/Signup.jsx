import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../signup/Signup.css";
import Login from "../login/Login";
import axios from "axios";
import { signupSchema } from "../../validations/schemas";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

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

  return (
    <div className="signlog-div">
      <div
        className={`container ${type === "signUp" ? "right-panel-active" : ""}`}
        id="container"
      >
        <div className="form-container sign-up-container">
          <form className="form-div" onSubmit={signupOnSubmit}>
            <div className="signup-heading">
              <h1 className="heading-h1">Create Account</h1>
              <p className="description">Enter your details to get started</p>
            </div>
            <div className="input-group">
              <input
                className="text-input"
                type="text"
                value={uname}
                onChange={(e) => setUname(e.target.value)}
                placeholder="Full Name"
                required
              />
              <span className="span-tag error-text">
                {validationErrors.uname}
              </span>
            </div>

            <div className="input-group">
              <input
                className="text-input"
                type="email"
                value={uemail}
                onChange={(e) => setUemail(e.target.value)}
                placeholder="Email Address"
                required
              />
              <span className="span-tag error-text">
                {validationErrors.uemail}
              </span>
            </div>

            <div className="input-group">
              <div className="password-wrapper">
                <input
                  className="text-input"
                  type={showPassword ? "text" : "password"}
                  value={upassword}
                  onChange={(e) => setUpassword(e.target.value)}
                  placeholder="Password"
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

            <div className="input-group">
              <div className="password-wrapper">
                <input
                  className="text-input"
                  type={showConfirmPassword ? "text" : "password"}
                  value={uconfirmPassword}
                  onChange={(e) => setUconfirmPassword(e.target.value)}
                  placeholder="Confirm Password"
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

            <button className="codepen-button" type="submit">
              Sign Up
            </button>

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
              <h1>Hello, Friend!</h1>
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
