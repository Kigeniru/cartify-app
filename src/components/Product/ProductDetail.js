import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ProductData from './ProductData'; // your static data
import egg from '../../assets/egg.png';
import milk from '../../assets/milk.png';
import sugar from '../../assets/sugar.png';
import './ProductDetail.css'; // Ensure your CSS file is imported

const ProductDetail = () => {
  const { id } = useParams();
  const [currentProductId, setCurrentProductId] = useState(parseInt(id));
  const [bubbleAnimate, setBubbleAnimate] = useState(false); // State to trigger bubble animation

  // Find the current product based on the ID
  const product = ProductData.find((item) => item.id === currentProductId);

  // Effect to update currentProductId if URL param changes (e.g., direct navigation)
  useEffect(() => {
    setCurrentProductId(parseInt(id));
  }, [id]);

  // Function to trigger bubble animation
  const triggerBubbleAnimation = () => {
    setBubbleAnimate(true);
    // Remove the class after the animation duration to allow it to be re-triggered
    const timer = setTimeout(() => {
      setBubbleAnimate(false);
    }, 600); // Should match or be slightly longer than bubbleDrift animation duration
    return () => clearTimeout(timer); // Cleanup on unmount
  };

  const handleNextProduct = () => {
    const currentIndex = ProductData.findIndex(item => item.id === currentProductId);
    const nextIndex = (currentIndex + 1) % ProductData.length;
    setCurrentProductId(ProductData[nextIndex].id);
    triggerBubbleAnimation(); // Trigger animation on slide change
  };

  const handlePreviousProduct = () => {
    const currentIndex = ProductData.findIndex(item => item.id === currentProductId);
    const prevIndex = (currentIndex - 1 + ProductData.length) % ProductData.length;
    setCurrentProductId(ProductData[prevIndex].id);
    triggerBubbleAnimation(); // Trigger animation on slide change
  };

  if (!product) return <div>Product not found</div>;

  return (
    <div className="product-detail">
      <div className="left">
         {/* Bubbles get the 'bubble-animated' class when bubbleAnimate is true */}
          <div className={`bubble bubble-top-right-large ${bubbleAnimate ? 'bubble-animated' : ''}`} style={{
            background: `linear-gradient(to bottom right, ${product.gradient?.[0]}, ${product.gradient?.[1]})`,
          }}></div>
          <div className={`bubble bubble-top-right-small ${bubbleAnimate ? 'bubble-animated' : ''}`} style={{
            background: `linear-gradient(to bottom right, ${product.gradient?.[0]}, ${product.gradient?.[1]})`,
          }}></div>
          <div className={`bubble bubble-bottom-left ${bubbleAnimate ? 'bubble-animated' : ''}`} style={{
            background: `linear-gradient(to bottom right, ${product.gradient?.[0]}, ${product.gradient?.[1]})`,
          }}></div>
        <div
          className="circle-bg"
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
        <button className="add-cart">Add to Cart</button>
      </div>
    </div>
  );
};

export default ProductDetail;