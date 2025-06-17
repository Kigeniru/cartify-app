import React from 'react'
import './Footer.css'
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
                    <li>Home</li>
                    <li>Delivery</li>
                    <li>Privacy Policy</li>
                    <li>Product Care</li>
                </ul>
            </div>
             <div class="footer-content-right">
                <h2> GET IN TOUCH</h2>
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
