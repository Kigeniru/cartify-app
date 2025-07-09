import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { auth } from './firebase'; // Import auth from firebase.js
import { onAuthStateChanged, signOut } from 'firebase/auth'; // Import onAuthStateChanged and signOut

// Components
import Navbar from "./components/Navbar/Navbar";
import Sidebar from "./components/Sidebar/Sidebar";

// Pages
import Dashboard from "./pages/Dashboard/Dashboard";
import Order from "./pages/Order/Order";
import Product from "./pages/Product/Product";
import Customer from "./pages/Customers/Customer";
import Category from "./pages/Category/Category";
import StaticPages from "./pages/StaticPages/StaticPages";
import Add from "./pages/Product/Add";

// Login Component
import AdminLogin from './components/AdminLogin/AdminLogin';

// Toast notifications
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const [user, setUser] = useState(null); // State to hold authenticated user
  const [isAdmin, setIsAdmin] = useState(false); // State for admin status
  const [loadingAuth, setLoadingAuth] = useState(true); // State to track auth loading
  const navigate = useNavigate(); // Hook for navigation

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser); // Set the user (null if not logged in, user object if logged in)
      setLoadingAuth(false); // Auth state has been determined

      if (currentUser) {
        // User is logged in. Now, get their ID token to check custom claims.
        try {
          // 'true' forces a refresh of the ID token, crucial for checking fresh claims
          const idTokenResult = await currentUser.getIdTokenResult(true);
          const userIsAdmin = !!idTokenResult.claims.admin; // Check for the 'admin' claim
          setIsAdmin(userIsAdmin);

          if (userIsAdmin) {
            // If user is an admin, navigate to dashboard if they are on login page
            if (window.location.pathname === '/login') {
              navigate('/dashboard');
            }
          } else {
            // User is logged in but NOT an admin.
            // Immediately sign them out and redirect to login with an error.
            await signOut(auth); // Sign out the non-admin user
            toast.error("Access Denied: You do not have administrative privileges.");
            navigate('/login'); // Redirect to login page
          }
        } catch (error) {
          console.error("Error getting ID token or claims:", error);
          setIsAdmin(false); // Assume not admin if error
          toast.error("Failed to verify admin status. Please try again.");
          await signOut(auth); // Log out if claims check fails to prevent stuck state
          navigate('/login'); // Redirect to login page
        }
      } else {
        // User is not logged in.
        setIsAdmin(false); // Not logged in, so definitely not an admin
        // Redirect to login page if not already there
        if (window.location.pathname !== '/login') {
          navigate('/login');
        }
      }
    });

    // Cleanup subscription on component unmount
    return () => unsubscribe();
  }, [navigate]); // Add navigate to dependency array

  // Function to handle successful login (passed to AdminLogin component)
  const handleLoginSuccess = () => {
    // onAuthStateChanged listener in useEffect will automatically update the 'user' state
    // and trigger the admin check and subsequent navigation/logout.
    // No explicit action needed here, as the useEffect handles the outcome.
  };

  // Function to handle logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.info("Logged out successfully!");
      navigate('/login'); // Redirect to login page after logout
    } catch (error) {
      console.error("Error logging out:", error.message);
      toast.error("Error logging out: " + error.message);
    }
  };

  // Render loading state while checking authentication
  if (loadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-700 text-xl">Checking authentication status...</p>
      </div>
    );
  }

  // Render the application based on authentication status and admin role
  return (
    <div>
      {user && isAdmin ? ( // User is logged in AND is an admin
        <>
          <Navbar onLogout={handleLogout} /> {/* Pass handleLogout to Navbar */}
          <hr />
          <div className="app-content flex"> {/* Assuming app-content needs flex for sidebar/main content */}
            <Sidebar />
              <Routes>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/category" element={<Category />} />
                <Route path="/product" element={<Product />} />
                <Route path="/product/add" element={<Add />} />
                <Route path="/product/edit/:productId" element={<Add />} />
                <Route path="/orders" element={<Order />} />
                <Route path="/customer" element={<Customer />} />
                <Route path="/staticpages" element={<StaticPages />} />
                {/* Fallback route for any unhandled paths when logged in as admin */}
                <Route path="*" element={<Dashboard />} />
              </Routes>
          </div>
        </>
      ) : ( // User is either not logged in, or logged in but NOT an admin (and was immediately logged out)
        <Routes>
          {/* Only show login page */}
          <Route path="/login" element={<AdminLogin onLoginSuccess={handleLoginSuccess} />} />
          {/* Catch-all: any other path redirects to login if not authenticated or not admin */}
          <Route path="*" element={<AdminLogin onLoginSuccess={handleLoginSuccess} />} />
        </Routes>
      )}

      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
}

export default App;
