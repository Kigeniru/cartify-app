import React, { useEffect, useState } from 'react';
import './OrderStatus.css';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import { onAuthStateChanged } from 'firebase/auth';

function OrderStatus() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // Helper function to format currency
  const formatCurrency = (amount) => {
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(numericAmount)) return 'N/A';
    return numericAmount.toLocaleString('en-PH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Helper function to format date for MM/DD/YYYY HH:MM
  const formatDate = (timestamp) => {
    if (!timestamp || typeof timestamp.toDate !== 'function') return 'N/A';
    const date = timestamp.toDate();
    const options = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false // Use 24-hour format
    };
    return new Intl.DateTimeFormat('en-US', options).format(date);
  };

  // Effect to listen for Firebase authentication state changes
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribeAuth(); // Cleanup auth subscription
  }, []);

  // Effect to set up real-time listener for orders when the user state changes
  useEffect(() => {
    let unsubscribeFirestore = () => {}; // Initialize as a no-op function

    const setupOrderListener = () => {
      if (!user) {
        setOrders([]);
        setLoading(false);
        return;
      }

      setLoading(true);

      // Query to get orders where 'userId' matches the current user's UID
      const q = query(collection(db, "orders"), where("userId", "==", user.uid));

      // Set up the real-time listener using onSnapshot
      unsubscribeFirestore = onSnapshot(q, (querySnapshot) => {
        const userOrders = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setOrders(userOrders);
        setLoading(false);
      }, (error) => {
        console.error("Error fetching real-time orders:", error);
        setLoading(false);
      });
    };

    setupOrderListener();

    return () => unsubscribeFirestore(); // Cleanup Firestore listener
  }, [user]); // Re-run this effect whenever 'user' changes

  if (!user) {
    return <p className='cart-container'>Please sign in to view your orders.</p>;
  }

  if (loading) {
    return <p className='cart-container'>Loading your orders...</p>;
  }

  return (
    <div className='cart-container'>
      <div className='cart-header'>
        <div className='cart-header-content'>Your Orders</div>
      </div>

      {orders.length > 0 ? (
        <div className="orders-list-container">
          {orders.map((order) => (
            <div key={order.id} className="user-order-card">
              <div className="order-card-header">
                {/* REMOVED: <h3>Order ID: {order.id}</h3> */}
                <p>Order Date: {formatDate(order.createdAt)}</p>
                <p>Total Amount: ₱{formatCurrency(order.totalAmount)}</p>
                <span className={`order-status status-${(order.status || "Pending").toLowerCase().replace(/\s/g, '-')}`}>
                  {order.status || "Pending"}
                </span>
              </div>

              <div className='table-header order-item-table-header'>
                <span>Product</span>
                <span>Price</span>
                <span>Quantity</span>
                <span>Subtotal</span>
              </div>

              {Array.isArray(order.items) && order.items.map((item, index) => (
                <div key={`${order.id}-${index}`} className='cart-item'>
                  <div className='product'>
                    <img src={item.image || "https://placehold.co/50"} alt={item.name} />
                    <div>{item.name}</div>
                  </div>
                  <div>₱{formatCurrency(item.price)}</div>
                  <div className='quantity-control'>
                    <span>{item.quantity}</span>
                  </div>
                  <div>₱{formatCurrency(item.price * item.quantity)}</div>
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : (
        <p className="no-orders-message">No orders found.</p>
      )}
    </div>
  );
}

export default OrderStatus;