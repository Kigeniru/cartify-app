import React, {useState} from 'react'
import './LoginPopUp.css'
import { IoClose } from "react-icons/io5";

const LoginPopUp = ({setShowLogin}) => {
    const[currState,setCurrState] = useState("Login");
  return (
    <div className='login-popup'>
      <form class="login-popup-container">
        <div class="login-popup-title">
            <h2>{currState}</h2>
            <IoClose className="icon" onClick={()=>setShowLogin(false)} />

        </div>
        <div class="login-popup-inputs">
            {currState==="Login"?<></>:<input type="text" placeholder='Your Name' required />}
            
            <input type="email" placeholder='Your Email' required />
            <input type="password" placeholder='Password' required />
        </div>
        <button>{currState==="Sign Up"?"Create account":"Login"}</button>
      <div class="login-popup-condition">
        <input type="checkbox" required />
        <p>By continuing, I agree to the terms of use & privacy policy</p>
      </div>
      {currState==="Login"
      ?<p>Create a new account? <span onClick={()=>setCurrState("Signup")}> Click here</span></p>
      :<p> Already have an acoount? <span onClick={()=>setCurrState("Login")}> Login here</span></p>}
      
      
      </form>
    </div>
  )
}

export default LoginPopUp
