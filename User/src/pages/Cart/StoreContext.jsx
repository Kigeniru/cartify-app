import React, { createContext, useState, useEffect } from 'react';
import ProductData from '../../components/Product/ProductData.js';

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
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

    // <-- ADD THESE NEW FUNCTIONS -->

    // Function to remove an item completely from the cart (set its quantity to 0)
    const removeCompletelyFromCart = (itemId) => {
        setCartItems((prev) => ({ ...prev, [itemId]: 0 }));
    };

    // Function to clear the entire cart by resetting the state to an empty object
    const clearCart = () => {
        setCartItems({});
    };

    // <-- END OF NEW FUNCTIONS -->

    const getTotalCartAmount = () => {
        let totalAmount = 0;
        for (const item in cartItems) {
            if (cartItems[item] > 0) {
                let itemInfo = food_list.find((product) => product.id === parseInt(item));
                if (itemInfo) {
                    totalAmount += itemInfo.price * cartItems[item];
                }
            }
        }
        return totalAmount;
    };

    // <-- ADD THE NEW FUNCTIONS TO THE CONTEXT VALUE -->
    const contextValue = {
        food_list,
        cartItems,
        setCartItems,
        addToCart,
        removeFromCart,
        getTotalCartAmount,
        removeCompletelyFromCart, // <-- ADD THIS
        clearCart // <-- AND THIS
    };
    // <-- END OF ADDITIONS -->

    return (
        <StoreContext.Provider value={contextValue}>
            {props.children}
        </StoreContext.Provider>
    );
};

export default StoreContextProvider;