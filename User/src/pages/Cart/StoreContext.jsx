import React, { createContext, useState, useEffect } from 'react';
// Remove the static ProductData import
// import ProductData from '../../components/Product/ProductData.js';

// Import Firebase db and Firestore functions
import { db } from '../../firebase'; // Adjust path if your firebase config is elsewhere
import { collection, getDocs } from 'firebase/firestore';

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
    const [cartItems, setCartItems] = useState({});
    // Change food_list to a state variable and initialize as empty array
    const [food_list, setFoodList] = useState([]);

    // --- Effect to load cartItems from local storage on initial render ---
    useEffect(() => {
        const getCartFromLocalStorage = () => {
            try {
                const storedCart = localStorage.getItem('cartItems');
                // Ensure it returns an empty object if no cart is stored or parsing fails
                return storedCart ? JSON.parse(storedCart) : {};
            } catch (error) {
                console.error("Error parsing cart from local storage:", error);
                return {};
            }
        };
        setCartItems(getCartFromLocalStorage());
    }, []); // Empty dependency array ensures this runs only once on mount

    // --- Effect to save cartItems to local storage whenever cartItems state changes ---
    useEffect(() => {
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
    }, [cartItems]); // Dependency array ensures this runs when cartItems changes

    // --- NEW: Effect to fetch food_list from Firebase when the component mounts ---
    useEffect(() => {
        const fetchFoodList = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, 'products')); // Fetch from 'products' collection
                const productsArray = querySnapshot.docs.map(doc => ({
                    id: doc.id, // Get the document ID
                    ...doc.data() // Get all other fields
                }));
                setFoodList(productsArray); // Update the food_list state
            } catch (error) {
                console.error("Error fetching food list from Firebase:", error);
                // Optionally, handle this error (e.g., set an error state, show a toast)
            }
        };

        fetchFoodList();
    }, []); // Empty dependency array means this runs only once on initial mount


    const addToCart = (itemId) => {
        setCartItems((prev) => {
            // [itemId]: (prev[itemId] || 0) + 1 handles undefined initial state for new items
            return { ...prev, [itemId]: (prev[itemId] || 0) + 1 };
        });
    };

    const removeFromCart = (itemId) => {
        setCartItems((prev) => {
            // Ensure quantity doesn't go below zero
            return { ...prev, [itemId]: Math.max(0, (prev[itemId] || 0) - 1) };
        });
    };

    const removeCompletelyFromCart = (itemId) => {
        setCartItems((prev) => ({ ...prev, [itemId]: 0 }));
    };

    const clearCart = () => {
        setCartItems({});
    };

    const getTotalCartAmount = () => {
        let totalAmount = 0;
        // Ensure food_list is loaded before calculating total
        if (food_list.length === 0) {
            // console.warn("Food list not loaded yet, total amount may be inaccurate.");
            return 0; // Return 0 if products haven't loaded yet
        }

        for (const itemId in cartItems) { // Iterate through the keys (product IDs) in cartItems
            if (cartItems[itemId] > 0) { // If the quantity is greater than 0
                // Find the product information from the fetched food_list
                // Note: item.id from Firebase is a string, so direct comparison `product.id === itemId` is correct
                let itemInfo = food_list.find((product) => product.id === itemId);
                if (itemInfo) { // Ensure product info is found
                    totalAmount += itemInfo.price * cartItems[itemId];
                } else {
                    console.warn(`Product with ID ${itemId} not found in food_list.`);
                }
            }
        }
        return totalAmount;
    };

    const contextValue = {
        food_list, // Now this will contain products fetched from Firebase
        cartItems,
        setCartItems, // Useful if you need to directly set cart items in some cases
        addToCart,
        removeFromCart,
        getTotalCartAmount,
        removeCompletelyFromCart,
        clearCart
    };

    return (
        <StoreContext.Provider value={contextValue}>
            {props.children}
        </StoreContext.Provider>
    );
};

export default StoreContextProvider;