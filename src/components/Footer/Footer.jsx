import React from 'react'
import './Footer.css'
import { Link } from 'react-router-dom';
import logo from '../../assets/mvillo-logo.png';
const Footer = () => {
  return (
    <div className='footer' id='footer'>
        <div class="footer-content">
            <div class="footer-content-left">
                 <img src = {logo} alt="" className='logo' />
                <p> Lorem Ipsum is simply a dummy text of the printing and typing industry.</p>
                

            </div>
        
            <div class="footer-content-center">
                <h2>COMPANY</h2>
               <ul>
    <li><Link to="/" className="text-white no-underline transition-all duration-200 hover:text-gray-300 hover:scale-105">Home</Link></li>
    <li><Link to="/product-care" className="text-white no-underline transition-all duration-200 hover:text-gray-300 hover:scale-105">Product Care</Link></li>
    <li><Link to="/terms-and-conditions" className="text-white no-underline transition-all duration-200 hover:text-gray-300 hover:scale-105">Terms and Conditions</Link></li>
    <li><Link to="/privacy-policy" className="text-white no-underline transition-all duration-200 hover:text-gray-300 hover:scale-105">Privacy Policy</Link></li>
</ul>
            </div>
             <div class="footer-content-right">
                <h2> CONTACT US</h2>
                <ul>
                    <li>+09171234567</li>
                    <li>dummy@mail.com</li>

                </ul>
            </div>
        </div>

        <hr />
        <p class="footer-copyright">Copyright 2025 Mvillo.com - All Rights Reserved.</p>
      
    </div>
  )
}

export default Footer
