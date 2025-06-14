import React from "react";
import "../styles/product.css";
import icon from "../assets/mvillo-logo.png";
import lecheImg from "../assets/leche-logo.png";
import friesImg from "../assets/fries-logo.png";

function Product() {
  return (
    <div className="product-page">
      <header>
  <div className="header-left">
    <div className="logo">
      <img src={icon} alt="Site Icon" />
    </div>
    <nav>
      <a href="/product">Our Products</a>
      <a href="/cart">Purchases</a>
      <a href="/contact">Contact Us</a>
    </nav>
  </div>
  
  <a href="/cart">
    <div className="cart-icon">
      <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3">
        <path d="M280-80q-33 0-56.5-23.5T200-160q0-33 23.5-56.5T280-240q33 0 56.5 23.5T360-160q0 33-23.5 56.5T280-80Zm400 0q-33 0-56.5-23.5T600-160q0-33 23.5-56.5T680-240q33 0 56.5 23.5T760-160q0 33-23.5 56.5T680-80ZM246-720l96 200h280l110-200H246Zm-38-80h590q23 0 35 20.5t1 41.5L692-482q-11 20-29.5 31T622-440H324l-44 80h480v80H280q-45 0-68-39.5t-2-78.5l54-98-144-304H40v-80h130l38 80Zm134 280h280-280Z"/>
      </svg>
    </div>
  </a>
</header>

      <section className="products">
        <div className="product leche">
          <img src={lecheImg} alt="Leche Flan" />
          <h3>Leche Flan</h3>
          <div className="button-group">
            <a href="/vanilla" className="view-button">View Vanilla Harmony</a>
            <a href="/pandan" className="view-button">View Dreamy Pandan</a>
            <a href="/mango" className="view-button">View Tropical Mango</a>
            <a href="/lemon" className="view-button">View Lemon Serenade</a>
          </div>
        </div>

        <div className="product fries">
          <img src={friesImg} alt="Fries" />
          <h3>Fries</h3>
          <div className="button-group">
            <a href="/french" className="view-button">View French Fries</a>
            <a href="/twister" className="view-button">View Twister Fries</a>
            <a href="/crinkle" className="view-button">View Crinkle Fries</a>
            <a href="/crisscut" className="view-button">View Crisscut Fries</a>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Product;
