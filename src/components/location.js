import React, { useState, useEffect } from 'react';
import styles from '../styles/location.module.css';
import icon from "../assets/mvillo-logo.png";

const Location = () => {
  const [address, setAddress] = useState('');
  const [proceedDisabled, setProceedDisabled] = useState(true);
  const [selectedDelivery, setSelectedDelivery] = useState('No method selected');

  useEffect(() => {
    const storedDeliveryMethod = localStorage.getItem('deliveryMethod');
    if (storedDeliveryMethod) {
      setSelectedDelivery(storedDeliveryMethod);
    }
  }, []);

  const handleAddressChange = (e) => {
    const newAddress = e.target.value;
    setAddress(newAddress);
    setProceedDisabled(newAddress.trim() === '');
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    localStorage.setItem('deliveryAddress', address);
    window.location.href = '/summary';
  };

  return (
    <div>
      <header>
        <div className={styles.headerLeft}>
          <div className={styles.logo}>
            <img src={icon} alt="Site Icon" />
          </div>
          <nav>
            <a href="product.html">Our Products</a>
            <a href="#">Contact Us</a>
          </nav>
        </div>
      </header>

      <div className={styles.container}>
        <div className={styles.locationCard}>
          <div className={styles.selectedDelivery}>
            {`Selected delivery method: ${selectedDelivery}`}
          </div>

          <div
            style={{
              color: 'white',
              fontSize: '1.2rem',
              fontWeight: 'bold',
              marginBottom: '1.5rem',
            }}
          ><div class="locationStepText">
            One last step! Please enter the delivery location of the order:
            </div>
          </div>

          <form onSubmit={handleFormSubmit}>
            <input
              type="text"
              id="address"
              name="address"
              placeholder="Delivery Address"
              value={address}
              onChange={handleAddressChange}
              required
            />

            <button
              type="submit"
              className={styles.customUploadLabel}
              id="proceedBtn"
              disabled={proceedDisabled}
            >
              Proceed to Order Summary
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Location;
