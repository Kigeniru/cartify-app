import React, { useEffect, useState } from 'react';
import styles from '../styles/cart.module.css';
import icon from "../assets/mvillo-logo.png";

function Cart() {
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCartItems(savedCart);
  }, []);

  const handleRemoveItem = (index) => {
    const updatedCart = cartItems.filter((_, idx) => idx !== index);
    setCartItems(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const handleClearCart = () => {
    setCartItems([]);
    localStorage.removeItem("cart");
  };

  const handleUpdateQuantity = (index, delta) => {
    const updatedCart = [...cartItems];
    const item = updatedCart[index];
    let newQuantity = item.quantity + delta;

    // Ensure quantity doesn't go below 1
    if (newQuantity < 1) newQuantity = 1;

    // Update the quantity and subtotal
    item.quantity = newQuantity;
    updatedCart[index] = item;

    setCartItems(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  // Calculate the total price
  const totalAmount = cartItems.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2);

  return (
    <div className={styles['cart-container']}>
      <header className={styles['cart-header']}>
        <div className={styles['logo']}>
          <img src={icon} alt="Site Icon" />
        </div>
        <nav className={styles['cart-nav']}>
          <a href="/login">Home</a>
          <a href="/product">Our Products</a>
          <a href="/contact">Contact Us</a>
        </nav>
      </header>

      <div className={styles['cart-header']}>
        <div className={styles['cart-header-content']}>Your Cart</div>
      </div>

      <div className={styles['table-header']}>
        <span>Product</span>
        <span>Price</span>
        <span>Quantity</span>
        <span>Subtotal</span>
        <span>Actions</span>
      </div>

      {cartItems.length > 0 ? (
        cartItems.map((item, index) => (
          <div key={index} className={styles['cart-item']}>
            <div className={styles['product']}>
              <img src={item.image} alt={item.name} />
              <div>{item.name}</div>
            </div>
            <div>{item.price}</div>
            <div className={styles['quantity-control']}>
              <button onClick={() => handleUpdateQuantity(index, -1)}>-</button>
              <span>{item.quantity}</span>
              <button onClick={() => handleUpdateQuantity(index, 1)}>+</button>
            </div>
            <div>₱{(item.price * item.quantity).toFixed(2)}</div>
            <div>
              <button className={styles['delete-link']} onClick={() => handleRemoveItem(index)}>Remove</button>
            </div>
          </div>
        ))
      ) : (
        <p>Your cart is empty!</p>
      )}

      {/* Total Price Row */}
      {cartItems.length > 0 && (
        <div className={styles['cart-item-total']}>
          <div className={styles['product']}>Total:</div>
          <div className={styles['price']}>₱{totalAmount}</div>
          <div className={styles['quantity-control']}></div>
          <div className={styles['subtotal']}></div>
          <div className={styles['actions']}></div>
        </div>
      )}

      {/* Checkout Button Section */}
{cartItems.length > 0 && (
  <div className={styles['checkout']}>
    <div className={styles['checkout-buttons']}>
      <button onClick={handleClearCart}>Clear Cart</button>
      <a href="/checkout">
        <button>Proceed to Checkout</button>
      </a>
      <a href="/product">
        <button>Continue Shopping</button>
      </a>
    </div>
  </div>
)}


    </div>
  );
}

export default Cart;
