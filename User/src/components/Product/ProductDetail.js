// src/pages/ProductDetail/ProductDetail.js
import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../../firebase'; // Firebase instance
import { doc, getDoc, collection, getDocs, query, orderBy } from 'firebase/firestore'; // Firestore functions

// Static assets for ingredients (assuming these are generic and not dynamic per product in Firebase)
import egg from '../../assets/egg.png';
import milk from '../../assets/milk.png';
import sugar from '../../assets/sugar.png';
import './ProductDetail.css'; // Ensure your CSS file is imported

import { StoreContext } from '../../pages/Cart/StoreContext'; // Import your StoreContext

const ProductDetail = () => {
    const { id } = useParams(); // Product ID from URL (e.g., 'abc123' from /product/abc123)
    const navigate = useNavigate();
    const { addToCart } = useContext(StoreContext);

    const [product, setProduct] = useState(null); // State for the currently displayed product's details
    const [allProducts, setAllProducts] = useState([]); // State for all product IDs (for navigation)
    const [loadingProduct, setLoadingProduct] = useState(true); // Loading state for the specific product
    const [loadingAllProducts, setLoadingAllProducts] = useState(true); // Loading state for all products
    const [error, setError] = useState(null); // Error state
    const [bubbleAnimate, setBubbleAnimate] = useState(false); // For your UI animation

    // Effect to fetch ALL product IDs for navigation (runs once on component mount)
    useEffect(() => {
        const fetchAllProductIds = async () => {
            try {
                setLoadingAllProducts(true);
                const productsCollection = collection(db, 'products');
                // Order by 'createdAt' to ensure consistent next/previous logic
                // Ensure your products in Firestore have a 'createdAt' timestamp field
                const q = query(productsCollection, orderBy('createdAt', 'asc'));
                const querySnapshot = await getDocs(q);
                const productIds = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    // You could also store other minimal data here if needed for navigation UI (e.g., product name)
                }));
                setAllProducts(productIds);
            } catch (err) {
                console.error("Error fetching all product IDs for navigation:", err);
                setError("Failed to load navigation data. Please try refreshing.");
            } finally {
                setLoadingAllProducts(false);
            }
        };
        fetchAllProductIds();
    }, []); // Empty dependency array means this runs only once on initial mount

    // Effect to fetch the SPECIFIC product details (runs whenever the URL 'id' changes)
    useEffect(() => {
        const fetchProductDetail = async () => {
            if (!id) { // If for some reason 'id' is undefined
                setError("Product ID is missing in the URL.");
                setLoadingProduct(false);
                return;
            }
            try {
                setLoadingProduct(true);
                // Create a reference to the specific document in the 'products' collection
                const productRef = doc(db, 'products', id);
                const productSnap = await getDoc(productRef); // Fetch the document

                if (productSnap.exists()) {
                    // If the document exists, set the product state
                    setProduct({ id: productSnap.id, ...productSnap.data() });
                } else {
                    // If the document does not exist
                    setProduct(null);
                    setError("Product not found. It might have been removed.");
                }
            } catch (err) {
                console.error("Error fetching product detail:", err);
                setError("Failed to load product details. Please check your internet connection.");
            } finally {
                setLoadingProduct(false);
            }
        };
        fetchProductDetail();
    }, [id]); // This effect re-runs whenever the 'id' parameter in the URL changes

    // Animation trigger for bubbles
    const triggerBubbleAnimation = () => {
        setBubbleAnimate(true);
        const timer = setTimeout(() => {
            setBubbleAnimate(false);
        }, 600);
        return () => clearTimeout(timer); // Cleanup the timer
    };

    // Handler for navigating to the next product
    const handleNextProduct = () => {
        if (allProducts.length === 0) return; // Prevent errors if no products are loaded
        const currentIndex = allProducts.findIndex(item => item.id === id);
        // Calculate next index, looping back to the start if at the end
        const nextIndex = (currentIndex + 1) % allProducts.length;
        const nextProductId = allProducts[nextIndex].id;
        navigate(`/product/${nextProductId}`); // Navigate to the new product's detail URL
        triggerBubbleAnimation();
    };

    // Handler for navigating to the previous product
    const handlePreviousProduct = () => {
        if (allProducts.length === 0) return; // Prevent errors if no products are loaded
        const currentIndex = allProducts.findIndex(item => item.id === id);
        // Calculate previous index, looping to the end if at the start
        const prevIndex = (currentIndex - 1 + allProducts.length) % allProducts.length;
        const prevProductId = allProducts[prevIndex].id;
        navigate(`/product/${prevProductId}`); // Navigate to the new product's detail URL
        triggerBubbleAnimation();
    };

    // Handler for adding to cart and navigating
    const handleAddToCartAndNavigate = () => {
        if (product) { // Ensure product data is loaded before adding to cart
            addToCart(product.id);
            navigate('/cart');
        } else {
            console.warn("Cannot add to cart: Product data not loaded.");
            // Optionally show a toast notification here
        }
    };

    // --- Conditional Rendering for Loading, Error, Not Found States ---
    if (loadingProduct || loadingAllProducts) {
        return (
            <div className="product-detail loading-state" style={{ justifyContent: 'center', textAlign: 'center', marginTop: '150px' }}>
                <h2>Loading Product...</h2>
                <p>Please wait while we fetch the details.</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="product-detail error-message" style={{ justifyContent: 'center', textAlign: 'center', marginTop: '150px' }}>
                <h2>Error</h2>
                <p>{error}</p>
            </div>
        );
    }

    if (!product) { // If loading is false, but product is still null (means not found)
        return (
            <div className="product-detail not-found" style={{ justifyContent: 'center', textAlign: 'center', marginTop: '150px' }}>
                <h2>Product Not Found</h2>
                <p>The product you are looking for does not exist.</p>
            </div>
        );
    }

    // --- Render Product Details (only if 'product' is successfully loaded) ---
    return (
        <div className="product-detail">
            <div className="left">
                {/* Dynamically use product.lightColor and product.darkColor for gradients */}
                <div className={`bubble bubble-top-right-large ${bubbleAnimate ? 'bubble-animated' : ''}`} style={{
                    background: `linear-gradient(to bottom right, ${product.lightColor || '#f0f0f0'}, ${product.darkColor || '#d0d0d0'})`,
                }}></div>
                <div className={`bubble bubble-top-right-small ${bubbleAnimate ? 'bubble-animated' : ''}`} style={{
                    background: `linear-gradient(to bottom right, ${product.lightColor || '#f0f0f0'}, ${product.darkColor || '#d0d0d0'})`,
                }}></div>
                <div className={`bubble bubble-bottom-left ${bubbleAnimate ? 'bubble-animated' : ''}`} style={{
                    background: `linear-gradient(to bottom right, ${product.lightColor || '#f0f0f0'}, ${product.darkColor || '#d0d0d0'})`,
                }}></div>

                <div
                    className={`circle-bg ${bubbleAnimate ? 'animate-bubble' : ''}`}
                    style={{
                        background: `linear-gradient(to bottom right, ${product.lightColor || '#f0f0f0'}, ${product.darkColor || '#d0d0d0'})`,
                    }}
                >
                    {/* Use product.imageUrl for the image source */}
                    <img src={product.imageUrl} alt={product.name} className="detail-img" />
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
                {/* Use product.category if available, otherwise default to 'Leche Flan' */}
                <p className="category">{product.category || 'Leche Flan'}</p>
                <h1 className="product-title">{product.name}</h1>
                <p className="product-desc">
                    {/* Display description directly from Firebase */}
                    {product.description}
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
                <button className="add-cart" onClick={handleAddToCartAndNavigate}>
                    Add to Cart
                </button>
            </div>
        </div>
    );
};

export default ProductDetail;