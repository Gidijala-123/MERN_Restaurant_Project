import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../signup/Signup.css";
import axios from "axios";

function SignInForm() {
  const [validation, setValidation] = useState({
    emailError: "",
    passwordError: "",
    apiError: "",
  });
  const [uemail, setUemail] = useState("");
  const [upassword, setUpassword] = useState("");
  const navigate = useNavigate();

  // Dynamically determine the API URL
  const API_URL =
    process.env.REACT_APP_API_URL || "https://your-render-url.com";

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const loginOnSubmit = async (e) => {
    e.preventDefault();

    // Reset validation errors
    setValidation({
      emailError: "",
      passwordError: "",
      apiError: "",
    });

    // Validate email
    if (!validateEmail(uemail)) {
      setValidation((prev) => ({
        ...prev,
        emailError: "Invalid email format",
      }));
      return;
    }

    // Validate password
    if (upassword.length < 8) {
      setValidation((prev) => ({
        ...prev,
        passwordError: "Password must contain at least 8 characters",
      }));
      return;
    }

    try {
      const res = await axios.post(
        `${API_URL}/api/signupLoginRouter/loginUser`,
        {
          uemail,
          upassword,
        }
      );

      if (res.status === 200) {
        // Store token if your API returns one
        if (res.data.token) {
          localStorage.setItem("token", res.data.token);
        }
        navigate("/home");
      }
    } catch (err) {
      const errMessage =
        err.response?.data?.message ||
        err.response?.data ||
        "An error occurred. Please try again.";
      setValidation((prev) => ({
        ...prev,
        apiError: errMessage,
      }));
    }
  };

  return (
    <div className="form-container sign-in-container">
      <form onSubmit={loginOnSubmit}>
        <div className="login-heading">
          <h1 className="heading-h1">LOGIN</h1>
        </div>
        <input
          autoComplete="off"
          required
          className="text-input"
          type="email"
          name="email"
          value={uemail}
          onChange={(e) => setUemail(e.target.value)}
          placeholder="Enter your Email"
        />
        {validation.emailError && (
          <span className="error-message">{validation.emailError}</span>
        )}
        <input
          autoComplete="off"
          required
          className="text-input"
          type="password"
          name="password"
          value={upassword}
          onChange={(e) => setUpassword(e.target.value)}
          placeholder="Enter your Password"
        />
        {validation.passwordError && (
          <span className="error-message">{validation.passwordError}</span>
        )}
        {validation.apiError && (
          <span className="error-message">{validation.apiError}</span>
        )}
        <button className="codepen-button" type="submit">
          <span className="btn-span">Login</span>
        </button>
      </form>
    </div>
  );
}

export default SignInForm;
