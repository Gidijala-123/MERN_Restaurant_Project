import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../signup/Signup.css";
import axios from "axios";
import { loginSchema } from "../../validations/schemas";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

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
      const res = await axios.post(
        `${API_BASE_URL}/api/signupLoginRouter/loginUser`,
        { uemail, upassword }
      );

      if (res.status === 200) {
        const token = res.data["Access Token"];
        if (token) {
          localStorage.setItem("token", token);
        }
        // Assuming the API response includes user data with a name field
        if (res.data.user && res.data.user.name) {
          localStorage.setItem("userName", res.data.user.name);
        }
        navigate("/home");
      }
    } catch (err) {
      setApiError(err.response?.data?.Message || "Invalid email or password.");
    }
  };

  return (
    <form className="form-div" onSubmit={loginOnSubmit}>
      <div className="login-heading">
        <h1 className="heading-h1">Welcome Back</h1>
        <p className="description">
          Enter your credentials to access your account
        </p>
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
        <span className="span-tag error-text">{validationErrors.uemail}</span>
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

      <span className="span-tag error-text">{apiError}</span>

      <button className="codepen-button" type="submit">
        Login
      </button>

      <div className="mobile-toggle">
        Don't have an account? <span onClick={toggleMobile}>Sign Up</span>
      </div>
    </form>
  );
}

export default SignInForm;
