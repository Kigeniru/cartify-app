import React from 'react';
import './Navbar.css';
import logo from '../../assets/mvillo-logo.png'; // Assuming this path is correct

// Navbar component now accepts an 'onLogout' prop
const Navbar = ({ onLogout }) => {
  return (
    <div className='navbar'>
      <img className='logo' src={logo} alt="MVillo Logo"/>

      {/* Logout Button */}
      {onLogout && ( // Only render the button if onLogout prop is provided
        <button
          onClick={onLogout}
          className="logout-button" // Add a class for styling
        >
          Logout
        </button>
      )}
    </div>
  );
}

export default Navbar;
