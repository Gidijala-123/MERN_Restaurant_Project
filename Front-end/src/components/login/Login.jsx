import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../signup/Signup.css";
import axios from "axios";
import { loginSchema } from "../../validations/schemas";

function SignInForm() {
  const [validationErrors, setValidationErrors] = useState({});
  const [apiError, setApiError] = useState("");
  
  const [uemail, setUemail] = useState("");
  const [upassword, setUpassword] = useState("");
  const navigate = useNavigate();

  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:1111";

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
    <div className="form-container sign-in-container">
      <form className="form-div" onSubmit={loginOnSubmit}>
        <div className="login-heading">
          <h1 className="heading-h1">LOGIN</h1>
        </div>
        <input
          className="text-input"
          type="email"
          value={uemail}
          onChange={(e) => setUemail(e.target.value)}
          placeholder="Email Address"
        />
        <span className="span-tag error-text">{validationErrors.uemail}</span>
        
        <input
          className="text-input"
          type="password"
          value={upassword}
          onChange={(e) => setUpassword(e.target.value)}
          placeholder="Password"
        />
        <span className="span-tag error-text">{validationErrors.upassword}</span>
        
        <span className="span-tag error-text">{apiError}</span>
        
        <button className="codepen-button">
          <span className="btn-span">Login</span>
        </button>
      </form>
    </div>
  );
}

export default SignInForm;
