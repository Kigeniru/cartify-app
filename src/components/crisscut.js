import React, { useEffect } from "react";
import styles from "../styles/crisscut.module.css";
import icon from "../assets/mvillo-logo.png";
import crissImg from "../assets/criss-cut.png";

function Crisscut() {
  useEffect(() => {
    // OPTIONAL: Disable global app.css styles
    const appCssLink = [...document.styleSheets]
      .find(sheet => sheet.href && sheet.href.includes("app.css"));

    if (appCssLink) {
      appCssLink.ownerNode.disabled = true;
    }

    return () => {
      if (appCssLink) {
        appCssLink.ownerNode.disabled = false;
      }
    };
  }, []);

  const handleAddToCart = () => {
    const newProduct = {
      name: "Criss Cut",
      category: "Leche Flan",
      description:
        "With their unique waffle-like shape, criss cut fries offer a delightful texture, crispy on the edges and soft in the center. Their wide surface area makes them ideal for holding seasonings and dips, delivering both crunch and flavor in every bite.",
      image: crissImg,
      price: 150.0,
      quantity: 1,
    };

    const cart = JSON.parse(localStorage.getItem("cart")) || [];

    const existingIndex = cart.findIndex(
      (item) => item.name === newProduct.name
    );

    if (existingIndex !== -1) {
      cart[existingIndex].quantity += 1;
    } else {
      cart.push(newProduct);
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    window.location.href = "/cart";
  };

  return (
    <div className={styles["criss-theme"]}>
      <header className={styles["criss-header"]}>
        <div className={styles["header-left"]}>
          <div className={styles["logo"]}>
            <img src={icon} alt="Site Icon" />
          </div>
          <nav>
            <a href="/product">Our Products</a>
            <a href="/cart">Purchases</a>
            <a href="/contact">Contact Us</a>
          </nav>
        </div>
        <a href="/cart">
          <div className={styles["cart-icon"]}>
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3">
              <path d="M280-80q-33 0-56.5-23.5T200-160q0-33 23.5-56.5T280-240q33 0 56.5 23.5T360-160q0 33-23.5 56.5T280-80Zm400 0q-33 0-56.5-23.5T600-160q0-33 23.5-56.5T680-240q33 0 56.5 23.5T760-160q0 33-23.5 56.5T680-80ZM246-720l96 200h280l110-200H246Zm-38-80h590q23 0 35 20.5t1 41.5L692-482q-11 20-29.5 31T622-440H324l-44 80h480v80H280q-45 0-68-39.5t-2-78.5l54-98-144-304H40v-80h130l38 80Zm134 280h280-280Z" />
            </svg>
          </div>
        </a>
      </header>

      <main className={styles["criss-main"]}>
        <div className={styles["product-container"]}>
          <div className={styles["product-image"]}>
            <img src={crissImg} alt="Fries - Criss Cut" />
          </div>

          <div className={styles["product-details"]}>
            <div className={styles["category"]}>Fries</div>
            <div className={styles["product-title"]}>Criss Cut</div>
            <div className={styles["description"]}>
            With their unique waffle-like shape, criss cut fries offer a delightful texture, crispy on the edges and soft in the center. Their wide surface area makes them ideal for holding seasonings and dips, delivering both crunch and flavor in every bite.
            </div>
            <button className={styles["add-to-cart"]} onClick={handleAddToCart}>
              Add to Cart
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Crisscut;
