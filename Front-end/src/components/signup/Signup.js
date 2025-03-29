import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../signup/Signup.css";
import Login from "../login/Login";
import axios from "axios";

function Signup() {
  const [type, setType] = useState("signUp");
  const [validation, setValidation] = useState({
    nameError: "",
    passwordError: "",
    emailError: "",
    apiError: "",
    successMessage: "",
  });
  const [uname, setUname] = useState("");
  const [uemail, setUemail] = useState("");
  const [upassword, setUpassword] = useState("");
  const navigate = useNavigate();

  const toggleSignupLogin = (text) => {
    if (text !== type) {
      setType(text);
    }
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const signupOnSubmit = async (e) => {
    e.preventDefault();
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

    if (uname.length < 7) {
      setValidation((prev) => ({
        ...prev,
        nameError: "Name must contain at least 7 characters",
      }));
      return;
    } else {
      setValidation((prev) => ({
        ...prev,
        nameError: "",
      }));
    }

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

    try {
      const res = await axios.post(
        "http://localhost:1234/api/signupLoginRouter/registerUser",
        {
          uname,
          uemail,
          upassword,
        }
      );
      if (res.status === 200) {
        setValidation((prev) => ({
          ...prev,
          successMessage: "Registration successful! Redirecting to login...",
        }));
        setTimeout(() => {
          navigate("/login");
        }, 2000);
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
    <div className="signlog-div">
      <div
        className={`container ${type === "signUp" ? "right-panel-active" : ""}`}
        id="container"
      >
        <div className="form-container sign-up-container">
          <form className="form-div" onSubmit={signupOnSubmit}>
            <div className="signup-heading">
              <h1 className="heading-h1">SIGNUP</h1>
              {/* <span className="span-tag">
                <img
                  className="heading-img"
                  src="/edit.png"
                  alt="signup-heading"
                />
              </span> */}
            </div>
            <input
              autoComplete="off"
              required
              className="text-input"
              type="text"
              name="name"
              value={uname}
              onChange={(e) => setUname(e.target.value)}
              placeholder="Enter your Name"
            />
            <span className="span-tag">{validation.nameError}</span>
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
            <span className="span-tag">{validation.emailError}</span>
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
            <span className="span-tag">{validation.passwordError}</span>
            <span className="span-tag">{validation.apiError}</span>
            <span className="span-tag">{validation.successMessage}</span>
            <button className="codepen-button">
              <span className="btn-span">Register</span>
            </button>
          </form>
        </div>
        {type === "signIn" && <Login />}
        <div className="overlay-container">
          <div className="overlay">
            <div className="overlay-panel overlay-left">
              <h1>Welcome Back!</h1>
              <p className="description">
                To keep connected with us please login with your personal info
              </p>
              <button
                className="Btn"
                id="signIn"
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
                id="signUp"
                onClick={() => toggleSignupLogin("signUp")}
              >
                SIGNUP
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;
