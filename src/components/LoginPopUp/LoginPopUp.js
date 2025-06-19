import React, { useState } from 'react';
import './LoginPopUp.css';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase";
import { setDoc, doc } from "firebase/firestore";
import { toast } from "react-toastify";
import { IoClose, IoEye, IoEyeOff } from "react-icons/io5";
import SignInwithGoogle from './signInWIthGoogle';

import { sendPasswordResetEmail } from "firebase/auth";
import { sendEmailVerification } from "firebase/auth";
import { Link } from 'react-router-dom';


const LoginPopUp = ({ setShowLogin }) => {
  const [currState, setCurrState] = useState("Login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const isStrongPassword = (password) => {
    const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    return strongRegex.test(password);
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match!", { position: "top-center" });
      return;
    }

    if (!isStrongPassword(password)) {
      toast.error("Password must be 8+ chars, with uppercase, lowercase, number, and symbol.", {
        position: "top-center",
      });
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      const user = auth.currentUser;

      if (user) {
        await setDoc(doc(db, "Users", user.uid), {
          email: user.email,
          firstName: fname,
          lastName: lname,
          contactInfo: "",
          deliveryInfo: "",
          photo: ""
        });

          await sendEmailVerification(user); // 🔐 Send verification email

  toast.info("Verification email sent! Please check your inbox.", {
    position: "top-center",
  });

    setCurrState("Login"); // ✅ Switch back to Login screen

    


      }

    } catch (error) {
      console.error("Firebase error:", error.code);
      toast.error(error.message, {
        position: "bottom-center",
      });
    }
  };

const handleLogin = async (e) => {
  e.preventDefault();
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user; // User object will exist here for both verified and unverified users

    // --- Potential fix needed here! ---
    // Make sure 'user' is not null before accessing its properties.
    // While userCredential.user typically isn't null upon successful sign-in,
    // even for unverified users, it's a good practice to be defensive.
    if (user) { // <-- Add this check!
      if (!user.emailVerified) {
        toast.warning("Please verify your email before logging in by checking your inbox.", {
          position: "top-center",
        });

        await auth.signOut(); // Prevent unverified access
        return; // Important: Exit the function after handling unverified user
      }

      // If user is verified, proceed with successful login actions
      toast.success("User logged in Successfully", { position: "top-center" });
      window.location.href = "/";
    } else {
      // This case should ideally not be reached if signInWithEmailAndPassword resolves,
      // but it serves as a fallback for unexpected scenarios.
      console.error("Login successful but user object is unexpectedly null.");
      toast.error("An unexpected error occurred during login. Please try again.", { position: "bottom-center" });
    }

  } catch (error) {
    console.error("Firebase login error:", error.code);
    let errorMessage = error.message;

    // Provide more user-friendly messages for common errors
    if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
      errorMessage = "Invalid email or password.";
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = "Please enter a valid email address.";
    }
    // You could add specific handling for 'auth/too-many-requests' if needed

    toast.error(errorMessage, { position: "bottom-center" });
  }
};


    const handleForgotPassword = async () => {
    if (!email) {
        toast.error("Please enter your email first.", { position: "top-center" });
        return;
    }

    try {
        await sendPasswordResetEmail(auth, email);
        toast.success("Password reset email sent!", { position: "top-center" });
    } catch (error) {
        console.error("Password reset error:", error.code);
        toast.error("Failed to send reset email. " + error.message, { position: "bottom-center" });
    }
    };


  return (
    <div className='login-popup'>
      <form className="login-popup-container" onSubmit={currState === "Signup" ? handleRegister : handleLogin}>
        <div className="login-popup-title">
          <h2>{currState}</h2>
          <IoClose className="icon" onClick={() => setShowLogin(false)} />
        </div>

        <div className="login-popup-inputs">
          {currState === "Signup" ? null : <SignInwithGoogle />}
          {currState === "Login" ? null : (
            <>
              <input
                type="text"
                placeholder="First Name"
                required
                value={fname}
                onChange={(e) => setFname(e.target.value)}
              />
              <input
                type="text"
                placeholder="Last Name"
                required
                value={lname}
                onChange={(e) => setLname(e.target.value)}
              />
            </>
          )}

          <input
            type="email"
            placeholder="Your Email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {/* Password with visibility toggle */}
          <div className="password-field">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <span className="toggle-password" onClick={() => setShowPassword((prev) => !prev)}>
              {showPassword ? <IoEye /> : <IoEyeOff />}
            </span>
          </div>

          {/* Confirm Password with visibility toggle */}
          {currState === "Login" ? null : (
            <div className="password-field">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <span className="toggle-password" onClick={() => setShowConfirmPassword((prev) => !prev)}>
                {showConfirmPassword ? <IoEye /> : <IoEyeOff />}
              </span>
              
            </div>
          )}
          {currState === "Login" && (
        <p className="forgot-password" onClick={handleForgotPassword}>
            Forgot Password?
        </p>
        )}
        </div>

        <button className='login-signup-btn'>
          {currState === "Signup" ? "Create account" : "Login"}
        </button>

        <div className="login-popup-condition">
          <input type="checkbox" required />
          <p>By continuing, I agree to the <Link to='/terms-and-conditions'> terms and conditions </Link> & <Link to='privacy-place'>privacy policy</Link></p>
        </div>

        {currState === "Login" ? (
          <p>Create a new account? <span onClick={() => setCurrState("Signup")}> Click here</span></p>
        ) : (
          <p>Already have an account? <span onClick={() => setCurrState("Login")}> Login here</span></p>
        )}

        

      </form>
    </div>
  );
};

export default LoginPopUp;
