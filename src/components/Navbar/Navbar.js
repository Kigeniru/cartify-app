import React, { useState } from 'react';
import logo from '../../assets/mvillo-logo.png';
import { FaSearch } from "react-icons/fa";
import { FaBasketShopping } from "react-icons/fa6";
import './Navbar.css';
import { Link } from 'react-router-dom';

const Navbar = ({setShowLogin}) => {

    const [menu,setMenu] = useState("home");
  return (
    <div className='navbar'>

      <div class="navbar-content">

        <img src = {logo} alt="" className='logo' />
        <ul class="navbar-menu">
            <Link onClick={()=>setMenu("home")} className={menu==="home"?"active":""}>home</Link>
            <a href='#'onClick={()=>setMenu("menu")} className={menu==="menu"?"active":""}>products</a>
            <a href='#'onClick={()=>setMenu("mobile-app")} className={menu==="mobile-app"?"active":""}>mobile-app</a>
            <a href='footer'onClick={()=>setMenu("contact us")} className={menu==="contact-us"?"active":""}>contact us</a>
        </ul>
        <div class="navbar-right">
           
           <div class="navbar-search-icon">

            <FaBasketShopping className='icon'/>
            <div class="dot"></div>
           </div>
           <button onClick={()=>setShowLogin(true)}>sign-in</button>
        </div>
      </div>
    </div>
  )
}

export default Navbar
