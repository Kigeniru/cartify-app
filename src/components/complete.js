import React from 'react';
import styles from '../styles/summary.module.css';
import { Link } from 'react-router-dom';
import icon from "../assets/mvillo-logo.png";

const Complete = () => {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fefefe' }}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.logo}>
                <img src={icon} alt="Site Icon" />
            </div>
          <Link to="/" className={styles.navLink}>Home</Link>
          <Link to="/product" className={styles.navLink}>Product</Link>
        </div>
      </header>

      <div className={styles.summaryContainer}>
        <h2>Thank you for ordering!</h2>
        <p style={{ fontSize: '1.1rem', textAlign: 'center', marginTop: '1em' }}>
          Your order is being processed now.
         
          Please await a confirmation email.
        </p>

        <div style={{ textAlign: 'center', marginTop: '2em' }}>
          <Link to="/product" className={styles.customUploadLabel}>
            Back to Product Page
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Complete;
