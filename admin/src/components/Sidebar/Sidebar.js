import React from 'react'
import './Sidebar.css'

import { IoAddCircleOutline } from "react-icons/io5";
import { RiDashboardLine } from "react-icons/ri";
import { LuShapes } from "react-icons/lu";
import { FiTag } from "react-icons/fi";
import { LuUsersRound } from "react-icons/lu";
import { LuNewspaper } from "react-icons/lu";

import { FiShoppingBag } from "react-icons/fi";
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  return (
    <div className='sidebar'>
        <div className="sidebar-options">

            <NavLink to='/dashboard' className="sidebar-option">
            <RiDashboardLine className='icon' />
            <p>Dashboard</p>
            </NavLink>

            <NavLink to='/category' className="sidebar-option">
            <LuShapes className='icon' />
            <p>Category</p>
            </NavLink>

            <NavLink to='/product' className="sidebar-option">
            <FiTag  className='icon' />

            <p>Products</p>
            </NavLink>

            <NavLink to='/orders' className="sidebar-option">
           <FiShoppingBag  className='icon' />
            <p>Orders</p>
            </NavLink>

            <NavLink to='/customer' className="sidebar-option">
           <LuUsersRound className='icon' />
            <p>Customers</p>
            </NavLink>


            <NavLink to='/staticpages' className="sidebar-option">
           <LuNewspaper  className='icon' />
            <p>Pages</p>
            </NavLink>
        </div>
      
    </div>
  )
}

export default Sidebar
