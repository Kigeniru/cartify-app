import React, { useEffect } from "react";
import styles from "../styles/twister.module.css";
import icon from "../assets/mvillo-logo.png";
import twisterImg from "../assets/twister-cut.png";
import { db } from "./firebase"; 
import { setDoc, doc } from "firebase/firestore"; 
import { toast } from "react-toastify"; 

function Twister() {
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

  // Function to add the product to Firestore and localStorage
  const handleAddToCart = async () => {
    const newProduct = {
      name: "Twister Cut",
      category: "Leche Flan",
      description:
        "These spiral-shaped fries bring a playful twist to your plate. Seasoned with a bold blend of spices and curled to golden perfection, twister fries are crispy, zesty, and totally irresistible, bringing a flavorful snacking experience.",
      image: twisterImg,
      price: 700.0,
      quantity: 1,
    };

    const cart = JSON.parse(localStorage.getItem("cart")) || [];

    // Check if the product already exists in the cart
    const existingIndex = cart.findIndex((item) => item.name === newProduct.name);
    if (existingIndex !== -1) {
      cart[existingIndex].quantity += 1;
    } else {
      cart.push(newProduct);
    }

    // Save the cart to localStorage
    localStorage.setItem("cart", JSON.stringify(cart));

    // Add product to Firestore (Products collection)
    try {
      const productRef = doc(db, "Products", newProduct.name); // Use product name as the document ID
      await setDoc(productRef, newProduct); // Save the product data to Firestore
      toast.success("Product added to Firestore and cart successfully!", {
        position: "top-center",
      });
    } catch (error) {
      toast.error("Error adding product to Firestore: " + error.message, {
        position: "bottom-center",
      });
    }

    // Optionally, redirect to cart page after adding to cart
    window.location.href = "/cart";
  };

  return (
    <div className={styles["twister-theme"]}>
      <header className={styles["twister-header"]}>
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

      <main className={styles["twister-main"]}>
        <div className={styles["product-container"]}>
          <div className={styles["product-image"]}>
            <img src={twisterImg} alt="Leche Flan - Twister Cut" />
          </div>

          <div className={styles["product-details"]}>
            <div className={styles["category"]}>Leche Flan</div>
            <div className={styles["product-title"]}>Twister Cut</div>
            <div className={styles["description"]}>
            These spiral-shaped fries bring a playful twist to your plate. Seasoned with a bold blend of spices and curled to golden perfection, twister fries are crispy, zesty, and totally irresistible, bringing a flavorful snacking experience.
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

export default Twister;
