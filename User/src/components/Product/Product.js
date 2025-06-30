// src/pages/Product.js
import React from 'react';
import './Product.css';
import { Link } from 'react-router-dom';
import ProductData from './ProductData';

const Product = () => {
  return (
    <div className="product-container">
      {ProductData.map((item) => (
    <div
  className="product-card"
  style={{
    backgroundColor: item.bgColor,
    '--hover-gradient': `linear-gradient(135deg, ${item.gradient[0]}, ${item.gradient[1]})`,
  }}
  key={item.id}
>


          <div className="image-wrapper">
            <img src={item.image} alt={item.name} className="product-image" />
          </div>
          <div className="product-content">
            <h2 className="product-name">{item.name}</h2>
            <p className="product-price">₱{item.price}</p>
            <p className="product-description">{item.description}</p>
            <div className="view-details">
<Link to={`/product/${item.id}`}>
  <button>View Details</button>
</Link>

            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Product;
