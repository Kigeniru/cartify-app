// src/pages/ProductDetail/ProductDetail.js
import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // <--- Import useNavigate here
import ProductData from './ProductData'; // your static data
import egg from '../../assets/egg.png';
import milk from '../../assets/milk.png';
import sugar from '../../assets/sugar.png';
import './ProductDetail.css'; // Ensure your CSS file is imported

import { StoreContext } from '../../pages/Cart/StoreContext'; // Import your StoreContext

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate(); // <--- Get the navigate function
  const [currentProductId, setCurrentProductId] = useState(parseInt(id));
  const [bubbleAnimate, setBubbleAnimate] = useState(false);

  // Use useContext to get addToCart from your StoreContext
  const { addToCart } = useContext(StoreContext);

  // Find the current product based on the ID
  const product = ProductData.find((item) => item.id === currentProductId);

  useEffect(() => {
    setCurrentProductId(parseInt(id));
  }, [id]);

  const triggerBubbleAnimation = () => {
    setBubbleAnimate(true);
    const timer = setTimeout(() => {
      setBubbleAnimate(false);
    }, 600);
    return () => clearTimeout(timer);
  };

  const handleNextProduct = () => {
    const currentIndex = ProductData.findIndex(item => item.id === currentProductId);
    const nextIndex = (currentIndex + 1) % ProductData.length;
    setCurrentProductId(ProductData[nextIndex].id);
    triggerBubbleAnimation();
    // No need to navigate here, the URL changes will be handled by product selection
  };

  const handlePreviousProduct = () => {
    const currentIndex = ProductData.findIndex(item => item.id === currentProductId);
    const prevIndex = (currentIndex - 1 + ProductData.length) % ProductData.length;
    setCurrentProductId(ProductData[prevIndex].id);
    triggerBubbleAnimation();
    // No need to navigate here
  };

  // If product is not found, render a message or redirect
  if (!product) {
    return <div className="product-detail" style={{justifyContent: 'center', textAlign: 'center', marginTop: '150px'}}>
            <h2>Product Not Found</h2>
            <p>The leche flan you are looking for does not exist.</p>
           </div>;
  }

  // Define the new handler for "Add to Cart"
  const handleAddToCartAndNavigate = () => {
    addToCart(product.id);    // First, add the item to the cart
    navigate('/cart');         // Then, navigate to the cart page
  };


  return (
    <div className="product-detail">
      <div className="left">
        <div
          className={`circle-bg ${bubbleAnimate ? 'animate-bubble' : ''}`}
          style={{
            background: `linear-gradient(to bottom right, ${product.gradient?.[0]}, ${product.gradient?.[1]})`,
          }}
        >
          <img src={product.image} alt={product.name} className="detail-img" />
        </div>
        {/* Slider Arrows */}
        <div className="slider-arrow arrow-left" onClick={handlePreviousProduct}>
          &lt;
        </div>
        <div className="slider-arrow arrow-right" onClick={handleNextProduct}>
          &gt;
        </div>
      </div>
      <div className="right">
        <p className="category">Leche Flan</p>
        <h1 className="product-title">{product.name}</h1>
        <p className="product-desc">
          {product.description} It’s a delightful twist on the classic Filipino treat,
          traditionally made with egg yolks, condensed milk, and evaporated milk.
        </p>
        <h4>Contents:</h4>
        <div className="ingredients">
          <div className="ingredient-circle">
            <img src={egg} alt="egg" />
          </div>
          <div className="ingredient-circle">
            <img src={sugar} alt="sugar" />
          </div>
          <div className="ingredient-circle">
            <img src={milk} alt="milk" />
          </div>
        </div>
        {/* Attach the new handler to the button's onClick event */}
        <button className="add-cart" onClick={handleAddToCartAndNavigate}> {/* <--- Changed onClick here */}
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default ProductDetail;