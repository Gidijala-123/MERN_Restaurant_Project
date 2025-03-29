import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../signup/Signup.css"; // Assuming the same CSS file is used for consistency
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

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const loginOnSubmit = async (e) => {
    e.preventDefault();

    if (!validateEmail(uemail)) {
      setValidation((prev) => ({
        ...prev,
        emailError: "Invalid email format",
      }));
      return;
    } else {
      setValidation((prev) => ({
        ...prev,
        emailError: "",
      }));
    }

    if (upassword.length < 8) {
      setValidation((prev) => ({
        ...prev,
        passwordError: "Password must contain at least 8 characters",
      }));
      return;
    } else {
      setValidation((prev) => ({
        ...prev,
        passwordError: "",
      }));
    }

    try {
      const res = await axios.post(
        "http://localhost:1234/api/signupLoginRouter/loginUser", // Use the local backend URL
        {
          uemail,
          upassword,
        }
      );
      console.log("Login response:", res.data);
      if (res.status === 200) {
        navigate("/home"); // Redirect to a dashboard or home page after login
      }
    } catch (err) {
      const errMessage =
        err.response?.data || "An error occurred. Please try again.";
      setValidation((prev) => ({
        ...prev,
        apiError: errMessage,
      }));
    }
  };

  return (
    <>
      <div className="form-container sign-in-container">
        <form onSubmit={loginOnSubmit}>
          <div className="login-heading">
            <h1 className="heading-h1"> LOGIN </h1>{" "}
            {/* <span>
                    <img
                      className="heading-img"
                      src="/password.png"
                      alt="login-heading"
                    />
                  </span> */}{" "}
          </div>{" "}
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
          <span className="span-tag"> {validation.emailError} </span>{" "}
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
          <span className="span-tag"> {validation.passwordError} </span>{" "}
          <span className="span-tag"> {validation.apiError} </span>{" "}
          <button class="codepen-button">
            {" "}
            <span className="btn-span"> Login </span>
          </button>
        </form>{" "}
      </div>{" "}
      <div className="overlay-container">
        <div className="overlay">
          <div className="overlay-panel overlay-left">
            <h1> Welcome Back! </h1>{" "}
            <p className="description">
              To keep connected with us please login with your personal info{" "}
            </p>{" "}
            <button
              className="ghost"
              id="signIn"
              onClick={() => navigate("/login")}
            >
              Login{" "}
            </button>{" "}
          </div>{" "}
          <div className="overlay-panel overlay-right">
            <h1> Hello, Friend! </h1>{" "}
            <p className="description">
              Enter your personal details and start your journey with us{" "}
            </p>{" "}
            <button
              className="ghost"
              id="signUp"
              onClick={() => navigate("/signup")}
            >
              SIGNUP{" "}
            </button>{" "}
          </div>{" "}
        </div>{" "}
      </div>{" "}
    </>
  );
}

export default SignInForm;
