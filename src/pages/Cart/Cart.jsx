// src/pages/Cart/Cart.jsx
import React, { useContext } from 'react';
import './Cart.css';
import { StoreContext } from './StoreContext';

const Cart = () => {
    // Destructure addToCart along with the others
    const { cartItems, food_list, removeFromCart, addToCart, getTotalCartAmount } = useContext(StoreContext);

    return (
        <div className='cart'>
            <div className="cart-items">
                <div className="cart-items-title">
                    <p>Items</p>
                    <p>Title</p>
                    <p>Price</p>
                    <p>Quantity</p> {/* This column will now hold the +/- buttons and number */}
                    <p>Total</p>
                    <p>Remove</p> {/* This 'x' will now remove the item completely if quantity is 1, or decrement */}
                </div>
                <br />
                <hr />
                {/* Map through food_list to display items in the cart */}
                {food_list.map((item) => { // Removed 'index' as 'item.id' is a better key
                    // Only render if the item exists in cartItems and its quantity is greater than 0
                    if (cartItems[item.id] > 0) {
                        return (
                            // Add a unique key prop to the outermost element in map for React's efficiency
                            <div key={item.id}>
                                <div className='cart-items-title cart-items-item'>
                                    {/* Item Image */}
                                    <img src={item.image} alt={item.name} className="cart-item-image" />
                                    {/* Item Name */}
                                    <p>{item.name}</p>
                                    {/* Item Price */}
                                    <p>₱{item.price.toFixed(2)}</p> {/* Format price to 2 decimal places */}

                                    {/* Quantity controls: Minus, Quantity, Plus */}
                                    <div className='cart-item-quantity-control'>
                                        <span onClick={() => removeFromCart(item.id)} className='quantity-button minus-button'>-</span>
                                        <p>{cartItems[item.id]}</p>
                                        <span onClick={() => addToCart(item.id)} className='quantity-button plus-button'>+</span>
                                    </div>

                                    {/* Item Total Price (Price * Quantity) */}
                                    <p>₱{(item.price * cartItems[item.id]).toFixed(2)}</p> {/* Format total for item */}
                                    
                                    {/* 'x' to remove the item completely or decrement */}
                                    {/* Note: Based on your StoreContext, removeFromCart decrements.
                                        If you want 'x' to *always* remove completely, you'd need a separate
                                        function in StoreContext to set cartItems[itemId] to 0 or delete the key.
                                        For now, it will act like another decrement button. */}
                                    <p onClick={() => removeFromCart(item.id)} className='cross'>x</p>
                                </div>
                                <hr /> {/* Horizontal rule after each item */}
                            </div>
                        );
                    }
                    return null; // Don't render anything if the item is not in the cart
                })}
            </div>

            {/* Existing Cart Totals and Promo Code section */}
            <div className="cart-bottom">
                <div className="cart-total">
                    <h2>Cart Totals</h2>
                    <div>
                        <div className="cart-total-details">
                            <p>Subtotal</p>
                            <p>₱{getTotalCartAmount().toFixed(2)}</p> {/* Format total */}
                        </div>
                        <hr />
                        <div className="cart-total-details">
                            <p>Delivery Fee</p>
                            <p>₱{60.00.toFixed(2)}</p> {/* Format fixed fee */}
                        </div>
                        <hr />
                        <div className="cart-total-details">
                            <b>Total</b>
                            <b>₱{(getTotalCartAmount() + 60).toFixed(2)}</b> {/* Format grand total */}
                        </div>
                    </div>
                    <button>PROCEED TO CHECKOUT</button>
                </div>
                <div className="cart-promocode">
                    <p>If you have a promo code, Enter it here</p>
                    <div className='cart-promocode-input'>
                        <input type="text" placeholder='promo code' />
                        <button>Submit</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;