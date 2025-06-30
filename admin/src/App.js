import React, { useState } from "react";
import Navbar from "./components/Navbar/Navbar";
import Sidebar from "./components/Sidebar/Sidebar";

import Order from "./pages/Order/Order";
import {Routes, Route } from 'react-router-dom'
import Dashboard from "./pages/Dashboard/Dashboard";
import Product from "./pages/Product/Product";
import Customer from "./pages/Customers/Customer";
import Category from "./pages/Category/Category";
import StaticPages from "./pages/StaticPages/StaticPages";
import Add from "./pages/Product/Add";
function App() {

  return (
   <div>
    <Navbar/>
    <hr/>
    <div className="app-content">
      <Sidebar/>
      <Routes>
        <Route path="/dashboard" element={<Dashboard/>}/>
        <Route path="/category" element={<Category/>}/>
        <Route path="/product" element={<Product/>}/>
        <Route path="/product/add" element={<Add />} />

        <Route path="/orders" element={<Order/>}/>
        <Route path="/customer" element={<Customer/>}/>
        <Route path="/staticpages" element={<StaticPages/>}/>

      </Routes>
    </div>
   </div>
  );
}

export default App;
