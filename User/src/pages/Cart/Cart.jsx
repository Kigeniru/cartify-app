import React, { useContext } from 'react';
import './Cart.css';
import { StoreContext } from './StoreContext';
import { useNavigate } from 'react-router-dom';
import { FaTrash } from "react-icons/fa";

const Cart = () => {
    // Destructure the necessary functions from the context
    const { cartItems, food_list, removeFromCart, addToCart, getTotalCartAmount, removeCompletelyFromCart, clearCart } = useContext(StoreContext);

    const navigate = useNavigate();

    // Helper function for currency formatting
    const formatCurrency = (amount) => {
        // Use 'en-PH' for Philippine Peso locale, and specify currency as 'PHP'
        // You can change 'en-PH' to your desired locale if different.
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP', // Philippine Peso
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);
    };

    return (
        <div className='cart'>
            {/* Conditional rendering for an empty cart message */}
            {getTotalCartAmount() === 0 ? (
                <div className='cart-empty'>
                    <p>Your cart is empty!</p>
                    <button onClick={() => navigate('/product')}>Continue Shopping</button>
                </div>
            ) : (
                <>
                    <div className="cart-items">
                        <div className="cart-items-title">
                            <p>Items</p>
                            <p>Title</p>
                            <p>Price</p>
                            <p>Quantity</p>
                            <p>Total</p>
                            <p>Remove</p>
                        </div>
                        <br />
                        <hr />
                        {/* Map through food_list to display items in the cart */}
                        {food_list.map((item) => {
                            if (cartItems[item.id] > 0) {
                                return (
                                    <div key={item.id}>
                                        <div className='cart-items-title cart-items-item'>
                                            {/* Item Image */}
                                            <img src={item.imageUrl} alt={item.name} className="cart-item-image" />
                                            {/* Item Name */}
                                            <p>{item.name}</p>
                                            {/* Item Price - Formatted */}
                                            <p>{formatCurrency(item.price)}</p>

                                            {/* Quantity controls: Minus, Quantity, Plus */}
                                            <div className='cart-item-quantity-control'>
                                                <span onClick={() => removeFromCart(item.id)} className='quantity-button minus-button'>-</span>
                                                <p>{cartItems[item.id]}</p>
                                                <span onClick={() => addToCart(item.id)} className='quantity-button plus-button'>+</span>
                                            </div>

                                            {/* Item Total Price (Price * Quantity) - Formatted */}
                                            <p>{formatCurrency(item.price * cartItems[item.id])}</p>

                                            {/* 'x' to remove the item completely now */}
                                            <p onClick={() => removeCompletelyFromCart(item.id)} className='cross'><FaTrash/></p>
                                        </div>
                                        <hr />
                                    </div>
                                );
                            }
                            return null;
                        })}
                    </div>

                    {/* Existing Cart Totals section */}
                    <div className="cart-bottom">
                        <div className="cart-total">
                            <h2>Cart Totals</h2>
                            <div>
                                <div className="cart-total-details">
                                    <p>Subtotal</p>
                                    {/* Subtotal - Formatted */}
                                    <p>{formatCurrency(getTotalCartAmount())}</p>
                                </div>
                                <hr />
                                <div className="cart-total-details">
                                    <p>Delivery Fee</p>
                                    {/* Delivery Fee - Formatted */}
                                    <p>{formatCurrency(getTotalCartAmount() === 0 ? 0 : 60)}</p>
                                </div>
                                <hr />
                                <div className="cart-total-details">
                                    <b>Total</b>
                                    {/* Total - Formatted */}
                                    <b>{formatCurrency(getTotalCartAmount() === 0 ? 0 : getTotalCartAmount() + 60)}</b>
                                </div>
                            </div>
                            <div className="cart-total-buttons"> {/* NEW WRAPPER */}
                                <button onClick={() => navigate('/place-order')}>PROCEED TO CHECKOUT</button>
                                <button onClick={() => navigate('/product')} className="continue-shopping-button">CONTINUE SHOPPING</button> {/* NEW BUTTON */}
                            </div>
                        </div>

                        {/* REMOVED: The entire cart-promocode div was here */}

                    </div>

                    {/* Clear Cart button strategically placed at the top of the Cart Totals section */}
                    <div className='cart-actions'>
                        <button onClick={clearCart} className='clear-cart-button'>CLEAR CART</button>
                    </div>
                </>
            )}
        </div>
    );
};

export default Cart;