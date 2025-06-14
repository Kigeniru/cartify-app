import React from "react";
import styles from '../styles/delivery.module.css';
import icon from "../assets/mvillo-logo.png";

function Delivery() {
  const handleClick = (method) => {
    localStorage.setItem("deliveryMethod", method);
    window.location.href = "/location";
  };

  return (
    <div className={styles.deliveryPage}>
      <header>
        <div className="header-left">
          <div className="logo">
            <img src={icon} alt="Site Icon" />
          </div>
          <nav>
            <a href="/product">Our Products</a>
            <a href="/contact">Contact Us</a>
          </nav>
        </div>
      </header>

      <main className={styles.deliveryOptions}>
        <div className={`${styles.card} ${styles.pickup}`}>
          <h3>Pick-Up</h3>
          <p>Pick it up yourself from our local store.</p>
          <button className={styles.selectButton} onClick={() => handleClick("Pick-Up")}>Select Pick-Up</button>
        </div>

        <div className={`${styles.card} ${styles.meet}`}>
          <h3>Meet-Up</h3>
          <p>We'll meet at a nearby location that works for both of us.</p>
          <button className={styles.selectButton} onClick={() => handleClick("Meet-Up")}>Select Meet-Up</button>
        </div>

        <div className={`${styles.card} ${styles.delivery}`}>
          <h3>Delivery</h3>
          <p>We'll deliver your order right to your doorstep!</p>
          <button className={styles.selectButton} onClick={() => handleClick("Delivery")}>Select Delivery</button>
        </div>
      </main>
    </div>
  );
}

export default Delivery;
