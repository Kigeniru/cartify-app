// src/pages/Cart/StoreContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import ProductData from '../../components/Product/ProductData.js'; // Ensure this path is correct now!

export const StoreContext = createContext(null); // Export the context itself

const StoreContextProvider = (props) => { // This is the component you need to import and use
    const [cartItems, setCartItems] = useState({});
    const food_list = ProductData;

    const addToCart = (itemId) => {
        if (!cartItems[itemId]) {
            setCartItems((prev) => ({ ...prev, [itemId]: 1 }));
        } else {
            setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] + 1 }));
        }
    };

    const removeFromCart = (itemId) => {
        setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] - 1 }));
    };

    const getTotalCartAmount = () => {
        let totalAmount = 0;
        for (const item in cartItems) {
            if (cartItems[item] > 0) {
                // FIX: Convert 'item' to an integer for correct comparison
                let itemInfo = food_list.find((product) => product.id === parseInt(item)); // <--- Changed here!
                if (itemInfo) { // Add a check to ensure itemInfo is not undefined
                    totalAmount += itemInfo.price * cartItems[item];
                }
            }
        }
        return totalAmount;
    };

    const contextValue = {
        food_list,
        cartItems,
        setCartItems,
        addToCart,
        removeFromCart,
        getTotalCartAmount
    };

    return (
        <StoreContext.Provider value={contextValue}>
            {props.children}
        </StoreContext.Provider>
    );
};

export default StoreContextProvider;