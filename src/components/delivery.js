import React from "react";
import styles from '../styles/delivery.module.css';
import icon from "../assets/mvillo-logo.png";
import lalamoveIcon from "../assets/lala.png";

function Delivery() {
  const handlePersonalClick = () => {
    localStorage.setItem("deliveryMethod", "Personal Delivery");
    window.location.href = "/location";
  };

  const handleLalamoveClick = () => {
    localStorage.setItem("deliveryMethod", "Lalamove");
    window.location.href = "/location";
  };

  return (
    <div className={styles.deliveryPage}>
      {/* Styled Delivery Header */}
      <div className={styles['cart-header']}>
        <div className={styles['cart-header-content']}>Delivery</div>
      </div>

      <main className={styles.deliveryOptions}>
        <div className={`${styles.card} ${styles.delivery}`}>
          <img src={icon} alt="Mvillo Logo" className={styles.deliveryLogo} />
          <h3>Personal Delivery</h3>
          <p>Availability (Sat–Sun 9AM–9PM)</p>
          <button className={styles.selectButton} onClick={handlePersonalClick}>
            Select Delivery
          </button>
        </div>
        <div className={`${styles.card} ${styles.lalamove}`}>
          <img src={lalamoveIcon} alt="Lalamove Logo" className={styles.deliveryLogo} />
          <h3>Lalamove</h3>
          <p>Delivery via Lalamove (fees apply)</p>
          <button className={styles.selectButton} onClick={handleLalamoveClick}>
            Select Lalamove
          </button>
        </div>
      </main>
    </div>
  );
}

export default Delivery;