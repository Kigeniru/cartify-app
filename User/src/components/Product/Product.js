// src/pages/Product.js (User Side)

import React, { useEffect, useState, useMemo } from 'react';
import './Product.css';
import { Link } from 'react-router-dom';
import { db } from '../../firebase';
import { collection, onSnapshot, query } from 'firebase/firestore';

const Product = () => {
  const [products, setProducts] = useState([]);
  // FIX: Change this line from 'const [loading, setLoading] = true;'
  // to 'const [loading, setLoading] = useState(true);'
  const [loading, setLoading] = useState(true); // <--- CORRECTED LINE
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('none');

  useEffect(() => {
    const fetchProductsRealtime = () => {
      setLoading(true);
      setError(null);

      const productsCollectionRef = collection(db, 'products');
      const q = query(productsCollectionRef);

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const productsList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          isBestSeller: doc.data().isBestSeller || false,
          isAvailable: doc.data().isAvailable !== undefined ? doc.data().isAvailable : true
        }));
        setProducts(productsList);
        setLoading(false);
      }, (err) => {
        console.error("Error fetching real-time products:", err);
        setError("Failed to load products in real-time. Please try again later.");
        setLoading(false);
      });

      return () => unsubscribe();
    };

    fetchProductsRealtime();
  }, []);

  const getFirstSentence = (description) => {
    if (!description) return '';
    const endOfSentenceMatch = description.match(/[.!?]/);
    if (endOfSentenceMatch) {
      const firstSentenceEndIndex = endOfSentenceMatch.index + 1;
      const firstSentence = description.substring(0, firstSentenceEndIndex).trim();
      if (firstSentenceEndIndex < description.length) {
        return firstSentence + '...';
      }
      return firstSentence;
    }
    return description;
  };

  const filteredAndSortedProducts = useMemo(() => {
    let currentProducts = [...products];

    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      currentProducts = currentProducts.filter(product =>
        (product.name && product.name.toLowerCase().includes(lowerCaseSearchTerm)) ||
        (product.description && product.description.toLowerCase().includes(lowerCaseSearchTerm)) ||
        (product.category && product.category.toLowerCase().includes(lowerCaseSearchTerm))
      );
    }

    if (sortOrder !== 'none') {
      currentProducts.sort((a, b) => {
        if (sortOrder === 'price-asc') {
          return (a.price || 0) - (b.price || 0);
        } else if (sortOrder === 'price-desc') {
          return (b.price || 0) - (a.price || 0);
        } else if (sortOrder === 'name-asc') {
          return (a.name || '').localeCompare(b.name || '');
        } else if (sortOrder === 'name-desc') {
          return (b.name || '').localeCompare(a.name || '');
        } else if (sortOrder === 'category-asc') {
          return (a.category || '').localeCompare(b.category || '');
        } else if (sortOrder === 'category-desc') {
          return (b.category || '').localeCompare(a.category || '');
        }
        return 0;
      });
    }

    return currentProducts;
  }, [products, searchTerm, sortOrder]);

  if (loading) {
    return <div className="product-page-wrapper loading-message">Loading products...</div>;
  }

  if (error) {
    return <div className="product-page-wrapper error-message">{error}</div>;
  }

  return (
    <div className="product-page-wrapper">
        <div className="product-controls">
            <input
                type="text"
                placeholder="Search products, categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="product-search-input"
            />
            <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="product-sort-select"
            >
                <option value="none">Sort By</option>
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
                <option value="price-asc">Price (Low to High)</option>
                <option value="price-desc">Price (High to Low)</option>
                <option value="category-asc">Category (A-Z)</option>
                <option value="category-desc">Category (Z-A)</option>
            </select>
        </div>

        {filteredAndSortedProducts.length === 0 ? (
            <div className="no-products-message">No products found matching your criteria.</div>
        ) : (
            <div className="product-container">
                {filteredAndSortedProducts.map((item) => (
                    <div
                        className={`product-card ${item.isBestSeller ? 'best-seller' : ''} ${!item.isAvailable ? 'sold-out' : ''}`}
                        style={{
                            '--hover-gradient': `linear-gradient(135deg, ${item.lightColor || '#f0f0f0'}, ${item.darkColor || '#d0d0d0'})`,
                        }}
                        key={item.id}
                    >
                        {!item.isAvailable && <div className="sold-out-overlay">UNAVAILABLE</div>}
                        <div className="image-wrapper">
                            <img src={item.imageUrl} alt={item.name} className="product-image" />
                        </div>
                        <div className="product-content">
                            <h2 className="product-name">{item.name}</h2>
                            <p className="product-category">{item.category || 'Uncategorized'}</p>
                            <p className="product-price">
                                ₱{Number(item.price).toLocaleString('en-PH', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                })}
                            </p>
                            <p className="product-description">{getFirstSentence(item.description)}</p>
                            <div className="view-details">
                                <Link to={`/product/${item.id}`}>
                                    <button disabled={!item.isAvailable}>
                                        {item.isAvailable ? 'View Details' : 'Unavailable'}
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )}
    </div>
  );
};

export default Product;