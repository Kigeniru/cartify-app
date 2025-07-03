// src/pages/Product.js
import React, { useEffect, useState } from 'react';
import './Product.css';
import { Link } from 'react-router-dom';
import { db } from '../../firebase';
import { collection, getDocs } from 'firebase/firestore';

const Product = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const querySnapshot = await getDocs(collection(db, 'products'));
        const productsList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProducts(productsList);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Failed to load products. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Helper function to get the first sentence of a description
  const getFirstSentence = (description) => {
    if (!description) return ''; // Handle empty or null descriptions

    // Find the first occurrence of a period, exclamation mark, or question mark
    const endOfSentenceMatch = description.match(/[.!?]/);

    if (endOfSentenceMatch) {
      const firstSentenceEndIndex = endOfSentenceMatch.index + 1;
      // Extract the first sentence including the punctuation
      const firstSentence = description.substring(0, firstSentenceEndIndex).trim();

      // If the original description has more content after the first sentence, add ellipsis
      if (firstSentenceEndIndex < description.length) {
        return firstSentence + '...';
      }
      return firstSentence; // Return as is if it's already one sentence
    }

    // If no sentence-ending punctuation is found, return the whole description
    return description;
  };

  if (loading) {
    return <div className="product-container">Loading products...</div>;
  }

  if (error) {
    return <div className="product-container error-message">{error}</div>;
  }

  if (products.length === 0) {
    return <div className="product-container no-products-message">No products found.</div>;
  }

  return (
    <div className="product-container">
      {products.map((item) => (
        <div
          className="product-card"
          style={{
            '--hover-gradient': `linear-gradient(135deg, ${item.lightColor || '#f0f0f0'}, ${item.darkColor || '#d0d0d0'})`,
          }}
          key={item.id}
        >
          <div className="image-wrapper">
            <img src={item.imageUrl} alt={item.name} className="product-image" />
          </div>
          <div className="product-content">
            <h2 className="product-name">{item.name}</h2>
            <p className="product-price">
              ₱{Number(item.price).toLocaleString('en-PH', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
            {/* Apply the helper function here */}
            <p className="product-description">{getFirstSentence(item.description)}</p>
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