import { signInWithEmailAndPassword } from "firebase/auth";
import React, { useState } from "react";
import { auth } from "./firebase";
import { toast } from "react-toastify";
import SignInwithGoogle from "./LoginPopUp/signInWIthGoogle";
import "../styles/login.css"; 
import logo from "../assets/mvillo-logo.png"; 

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log("User logged in Successfully");
      toast.success("User logged in Successfully", {
        position: "top-center",
      });
      window.location.href = "/product";
    } catch (error) {
      console.error(error.message);
      toast.error(error.message, {
        position: "bottom-center",
      });
    }
  };

  return (
    <div className="main-container">
      <div className="logo-container">
        <img src={logo} alt="Logo" />
      </div>

      <div className="login-container">
        <h2>Log In</h2>
        <form onSubmit={handleSubmit}>
          <label className="form-label">Email Address</label>
          <input
            type="email"
            className="form-control"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label className="form-label">Password</label>
          <input
            type="password"
            className="form-control"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" className="btn btn-custom">
            Log In
          </button>

          <SignInwithGoogle />

          <p className="forgot-password text-right" style={{ marginTop: "10px" }}>
            New user? <a href="/register">Register Here</a>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;
