import React, { useEffect, useState } from 'react';
import styles from '../styles/cart.module.css';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from './firebase'; 
import { onAuthStateChanged } from 'firebase/auth';

function Order() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;

      const q = query(collection(db, "orders"), where("userId", "==", user.uid));
      const querySnapshot = await getDocs(q);
      const userOrders = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setOrders(userOrders);
      setLoading(false);
    };

    fetchOrders();
  }, [user]);

  if (!user) return <p className={styles['cart-container']}>Please sign in to view your orders.</p>;
  if (loading) return <p className={styles['cart-container']}>Loading your orders...</p>;

  return (
    <div className={styles['cart-container']}>
      {/* Organized Header */}
      <div className={styles['cart-header']}>
        <div className={styles['cart-header-content']}>Your Orders</div>
      </div>

      <div className={styles['table-header']}>
        <span>Product</span>
        <span>Price</span>
        <span>Quantity</span>
        <span>Subtotal</span>
        <span>Status</span>
      </div>

      {orders.length > 0 ? (
        orders.map((order, i) => (
          order.items.map((item, index) => (
            <div key={`${order.id}-${index}`} className={styles['cart-item']}>
              <div className={styles['product']}>
                <img src={item.image || "https://via.placeholder.com/50"} alt={item.name} />
                <div>{item.name}</div>
              </div>
              <div>₱{item.price.toFixed(2)}</div>
              <div className={styles['quantity-control']}>
                <span>{item.quantity}</span>
              </div>
              <div>₱{(item.price * item.quantity).toFixed(2)}</div>
              <div>{order.status || "Processing"}</div>
            </div>
          ))
        ))
      ) : (
        <p>No orders found.</p>
      )}
    </div>
  );
}

export default Order;
