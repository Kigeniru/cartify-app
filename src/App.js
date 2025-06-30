import React, { useEffect, useState } from "react";
import "../node_modules/bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./components/login";
import SignUp from "./components/register";
import Profile from "./components/profile";
//import Product from "./components/product"; // This is commented out
import Vanilla from "./components/vanilla";
import Pandan from "./components/pandan";
import Mango from "./components/mango";
import Lemon from "./components/lemon";
import Crinkle from "./components/crinkle";
import French from "./components/french";
import Twister from "./components/twister";
import Crisscut from "./components/crisscut";
//import Cart from "./components/cart"; // This looks like an old Cart component path
import Checkout from "./components/checkout";
import Delivery from "./components/delivery";
import Location from "./components/location";
import Summary from "./components/summary";
import Complete from "./components/complete";
import Navbar from "./components/Navbar/Navbar";

// THIS IS THE IMPORTANT IMPORT FOR YOUR CONTEXT PROVIDER
import StoreContextProvider from './pages/Cart/StoreContext';


import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { auth } from "./components/firebase";
import Home from "./pages/Home/Home";
import PlaceOrder from "./pages/PlaceOrder/PlaceOrder";

// IMPORTANT: Your Cart component is imported here as Basket
import Basket from "./pages/Cart/Cart"; // Ensure this is the correct Cart component you're working on

import Footer from "./components/Footer/Footer"
import LoginPopUp from "./components/LoginPopUp/LoginPopUp";
import ProfileSettings from "./pages/ProfileSettings/ProfileSettings";
import Product from "./components/Product/Product"; // This seems to be the correct Product component for the active Routes
import ProductDetail from "./components/Product/ProductDetail"; // This seems to be the correct ProductDetail component for the active Routes
import TermsAndConditions from "./pages/StaticPage/TermsAndConditions";
import ProductCare from "./pages/StaticPage/ProductCare";
import PrivacyPolicy from "./pages/StaticPage/PrivacyPolicy";

function App() {
  const [showLogin, setShowLogin] = useState(false);

  return (
    <>
      <ToastContainer />

      {showLogin ? <LoginPopUp setShowLogin={setShowLogin} /> : <></>}
      <div className="app">

        <Navbar setShowLogin={setShowLogin} />
        <div className="app-content">
          {/* ********** START OF INSERTION **********
            Wrap the <Routes> component with <StoreContextProvider>
            This ensures that all components rendered by these routes (including Basket/Cart)
            have access to the context.
          */}
          <StoreContextProvider>
            <Routes>
              <Route path='/' element={<Home />} />
              <Route path='/product' element={<Product />} />
              <Route path='/product/:id' element={<ProductDetail />} />

              <Route path='/cart' element={<Basket />} /> {/* This is the Cart component using useContext */}
              <Route path='/order' element={<PlaceOrder />} />
              <Route path='/profile' element={<ProfileSettings />} />

              <Route path='/terms-and-conditions' element={<TermsAndConditions />} />
              <Route path='/product-care' element={<ProductCare />} />
              <Route path='/privacy-policy' element={<PrivacyPolicy />} />

            </Routes>
          </StoreContextProvider>
          {/* ********** END OF INSERTION **********
          */}
        </div>
        <Footer />
      </div>
    </>
  );

  /* // ***************************************************************
  // ************* THIS SECTION REMAINS COMMENTED OUT **************
  // ***************************************************************
  
  const [user, setUser] = useState();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });

    return () => unsubscribe(); // Cleanup
  }, []);

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route
            path="/"
            element={user ? <Navigate to="/profile" /> : <Login />}
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<SignUp />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/product" element={<Product />} />
          <Route path="/vanilla" element={<Vanilla />} />
          <Route path="/pandan" element={<Pandan />} />
          <Route path="/mango" element={<Mango />} />
          <Route path="/lemon" element={<Lemon />} />
          <Route path="/crinkle" element={<Crinkle />} />
          <Route path="/french" element={<French />} />
          <Route path="/twister" element={<Twister />} />
          <Route path="/crisscut" element={<Crisscut />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/delivery" element={<Delivery />} />
          <Route path="/location" element={<Location />} />
          <Route path="/summary" element={<Summary />} />
          <Route path="/complete" element={<Complete />} />
        </Routes>
        <ToastContainer />
      </div>
    </Router>

    
  ); 
  */
}

export default App;