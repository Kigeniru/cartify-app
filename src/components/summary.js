import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import styles from '../styles/summary.module.css'; 
import icon from "../assets/mvillo-logo.png";

const Summary = () => {
  const [cart, setCart] = useState([]);
  const [deliveryAddress, setDeliveryAddress] = useState('Loading...');
  const [deliveryMethod, setDeliveryMethod] = useState('Loading...');
  const [paymentRef, setPaymentRef] = useState('Loading...');
  const [paymentDateTime, setPaymentDateTime] = useState('Loading...');
  const [paymentMobile, setPaymentMobile] = useState('Loading...');

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem('cart')) || [];
    const storedAddress = localStorage.getItem('deliveryAddress') || 'Not provided';
    const storedDelivery = localStorage.getItem('deliveryMethod') || 'Not selected';
    const storedRef = localStorage.getItem('paymentRef') || 'Not available';
    const storedDateTime = localStorage.getItem('paymentDateTime') || 'Not available';
    const storedMobile = localStorage.getItem('paymentMobile') || 'Not available';

    setCart(storedCart);
    setDeliveryAddress(storedAddress);
    setDeliveryMethod(storedDelivery);
    setPaymentRef(storedRef);
    setPaymentDateTime(storedDateTime);
    setPaymentMobile(storedMobile);
  }, []);

  return (
    <>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.logo}>
            <img src={icon} alt="Site Icon" />
          </div>
          <nav>
            <a href="/product" className={styles.navLink}>Our Products</a>
            <a href="/contact" className={styles.navLink}>Contact Us</a>
          </nav>
        </div>
      </header>

      <div className={styles.summaryContainer}>
        <h2>Order Summary</h2>

        <div className={styles.summarySection}>
          <h3>Items Ordered</h3>
          <div className={styles.cartItems}>
            {cart.length === 0 ? (
              <p>No items in the cart.</p>
            ) : (
              cart.map((item, index) => (
                <div className={styles.cartItem} key={index}>
                  <p><span className={styles.label}>Product:</span> {item.name}</p>
                  <p><span className={styles.label}>Quantity:</span> {item.quantity}</p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className={styles.summarySection}>
          <h3>Delivery Information</h3>
          <p><span className={styles.label}>Address:</span> {deliveryAddress}</p>
          <p><span className={styles.label}>Delivery Method:</span> {deliveryMethod}</p>
        </div>

        <div className={styles.summarySection}>
          <h3>Payment</h3>
          <p><span className={styles.label}>Reference No.:</span> {paymentRef}</p>
          <p><span className={styles.label}>Date & Time:</span> {paymentDateTime}</p>
          <p><span className={styles.label}>Mobile Number:</span> {paymentMobile}</p>
        </div>

        <div style={{ textAlign: 'center', marginTop: '2em' }}>
          <Link to="/complete">
            <button className={styles.customUploadLabel}>Confirm</button>
          </Link>
        </div>
      </div>
    </>
  );
};

export default Summary;
