import React, { useEffect, useState, useRef } from 'react';
import logo from '../../assets/mvillo-logo.png';
import { FaBasketShopping } from "react-icons/fa6";
import { FaUser, FaUserCircle } from "react-icons/fa";
import { FiLogOut } from "react-icons/fi";
import { IoIosArrowForward } from "react-icons/io";
import './Navbar.css';
import { Link, useLocation } from 'react-router-dom';
import { auth } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

const Navbar = ({ setShowLogin }) => {
  const [menu, setMenu] = useState("home");
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation();

  // Sync menu highlight with current route
  useEffect(() => {
    const path = location.pathname;
    if (path === "/") setMenu("home");
    else if (path.includes("/product")) setMenu("menu");
    else if (path.includes("/mobile")) setMenu("mobile-app");
    else if (path.includes("#footer")) setMenu("contact-us");
  }, [location.pathname]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    setShowDropdown(false);
    window.location.href = "/";
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className='navbar'>
      <div className="navbar-content">
        <img src={logo} alt="mvillo logo" className='logo' />

        <ul className="navbar-menu">
          <Link to="/" onClick={() => setMenu("home")} className={menu === "home" ? "active" : ""}>home</Link>
          <Link to="/product" onClick={() => setMenu("menu")} className={menu === "menu" ? "active" : ""}>products</Link>
          <Link to="/order" onClick={() => setMenu("order")} className={menu === "order" ? "active" : ""}>order</Link>
          <a href="#footer" onClick={() => setMenu("contact-us")} className={menu === "contact-us" ? "active" : ""}>contact us</a>
        </ul>

        <div className="navbar-right">
          <div className="navbar-search-icon">
            <Link to="/cart">
              <FaBasketShopping className='icon' />
              <div className="dot"></div>
            </Link>
          </div>

          {user ? (
            <div className="profile-section">
              <FaUser
                className="icon profile-icon"
                onClick={() => setShowDropdown(prev => !prev)}
              />
              {showDropdown && (
                <div className="profile-dropdown" ref={dropdownRef}>
                  <Link to="/profile" className="dropdown-item">
                    <div className="left">
                      <FaUserCircle />
                      <span>Edit Profile</span>
                    </div>
                    <IoIosArrowForward />
                  </Link>

                  <Link to="#" onClick={(e) => {
                    e.preventDefault();
                    handleLogout();
                  }} className="dropdown-item">
                    <div className="left">
                      <FiLogOut />
                      <span>Logout</span>
                    </div>
                    <IoIosArrowForward />
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <button onClick={() => setShowLogin(true)}>sign-in</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
