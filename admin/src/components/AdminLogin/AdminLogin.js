import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase'; // Make sure this path is correct
import './AdminLogin.css'; // Import the new CSS file

// AdminLogin Component
const AdminLogin = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault(); // Prevent default form submission
    setError(''); // Clear previous errors
    setLoading(true); // Set loading state

    try {
      // Attempt to sign in with email and password
      await signInWithEmailAndPassword(auth, email, password);
      // If successful, call the onLoginSuccess callback
      onLoginSuccess();
    } catch (err) {
      // Handle different Firebase authentication errors
      let errorMessage = 'Failed to log in. Please check your credentials.';
      switch (err.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential': // More generic for recent Firebase versions
          errorMessage = 'Invalid email or password.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Please enter a valid email address.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many login attempts. Please try again later.';
          break;
        default:
          console.error("Login error:", err.message);
          errorMessage = 'An unexpected error occurred. Please try again.';
      }
      setError(errorMessage);
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        <h2 className="admin-login-title">Admin Login</h2>

        <form onSubmit={handleLogin} className="admin-login-form">
          <div>
            <label htmlFor="email" className="admin-login-label">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="admin-login-input"
              placeholder="admin@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="admin-login-label">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="admin-login-input"
              placeholder="Enter your password"
            />
          </div>

          {error && (
            <div className="admin-login-error-message" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="admin-login-button"
          >
            {loading ? 'Logging In...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
