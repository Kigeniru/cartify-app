import React from "react";
import { NavbarMenu } from "./NavbarData";
import { FaBasketShopping } from "react-icons/fa6";
import { MdMenu } from "react-icons/md";


const Navbar = () => {
    return <nav>
        <div className="container">
            <div className="text-2xl flex items-center gap-2 font-bold py-8">
               <p>MVILLO</p> 
            </div>
            <div className="hidden md:block">
                <ul className="flex items-center gap-6 text-gray-600">
                {NavbarMenu.map((item)=>{
                    return <li key={item.id}>{item.title}
                    <a href = {item.link} className="inline-block py-1 px-3 hover:text-gray font-semibold">{item.title}</a>
                    </li>;

                })}
                </ul>
            </div>
        </div>
    
    </nav>
};

export default Navbar;