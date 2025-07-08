// src/pages/Order/Order.js
import React, { useEffect, useState } from 'react';
import './Order.css';
import { collection, getDocs, doc, updateDoc, query, orderBy } from 'firebase/firestore'; 
import { db, auth } from '../../firebase';
import { toast } from 'react-toastify';
import { onAuthStateChanged } from 'firebase/auth';

const Order = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [isAdminUser, setIsAdminUser] = useState(false); 

  // --- NEW STATE FOR SEARCH AND FILTER ---
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('All'); // Default to 'All'

  const orderStatuses = [
    "Pending",
    "Preparing Food Now",
    "Shipped",
    "Delivered",
    "Cancelled",
    "Refunded"
  ];

  // Effect to determine user auth state and admin claims (runs once on mount)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const idTokenResult = await currentUser.getIdTokenResult(true);
          setIsAdminUser(idTokenResult.claims && idTokenResult.claims.admin === true);
        } catch (error) {
          console.error("Auth state changed error:", error);
          setIsAdminUser(false);
        }
      } else {
        setIsAdminUser(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Effect to fetch orders (runs once on mount)
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true); 
      setError(null);
      try {
        // Fetch ALL orders since filtering will happen client-side
        const q = query(
          collection(db, "orders"),
          orderBy("createdAt", "desc") 
        );
        const querySnapshot = await getDocs(q);
        
        const allOrders = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setOrders(allOrders);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError("Failed to load orders. Please check your network or Firebase configuration.");
        toast.error("Failed to load orders.");
      } finally {
        setLoading(false); 
      }
    };

    fetchOrders(); 

  }, []); // Empty dependency array means this runs once on mount

  // --- NEW: Filtered Orders Logic ---
  const filteredOrders = orders.filter(order => {
    // 1. Filter by Search Term
    const matchesSearchTerm = searchTerm === '' || 
                              order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              (order.deliveryAddress?.firstName && order.deliveryAddress.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
                              (order.deliveryAddress?.lastName && order.deliveryAddress.lastName.toLowerCase().includes(searchTerm.toLowerCase())) ||
                              (order.deliveryAddress?.email && order.deliveryAddress.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
                              (order.deliveryAddress?.street && order.deliveryAddress.street.toLowerCase().includes(searchTerm.toLowerCase())) ||
                              (order.deliveryAddress?.city && order.deliveryAddress.city.toLowerCase().includes(searchTerm.toLowerCase())) ||
                              (order.deliveryAddress?.phoneNumber && order.deliveryAddress.phoneNumber.includes(searchTerm));

    // 2. Filter by Status
    const matchesStatus = selectedStatusFilter === 'All' || 
                          (order.status && order.status.toLowerCase() === selectedStatusFilter.toLowerCase());

    return matchesSearchTerm && matchesStatus;
  });


  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, {
        status: newStatus
      });
      toast.success(`Order ${orderId} status updated to ${newStatus}`);
      
      // Update the order's status in local state to reflect the change
      setOrders(prevOrders => prevOrders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));

    } catch (err) {
      console.error("Error updating order status:", err);
      toast.error(`Failed to update status for order ${orderId}. Check Firebase rules.`);
    }
  };

  const formatCurrency = (amount) => {
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(numericAmount)) return 'N/A';
    return numericAmount.toLocaleString('en-PH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatDate = (timestamp) => {
    if (!timestamp || !timestamp.toDate) return 'N/A';
    const date = timestamp.toDate();
    return date.toLocaleString();
  };

  if (loading) {
    return <div className="orders-container">Loading orders...</div>;
  }

  if (error) {
    return <div className="orders-container error-message">{error}</div>;
  }

  return (
    <div className="orders-container">
      <h2 className="orders-title">Customer Orders</h2> 

      {/* --- NEW: Search and Filter Bar --- */}
      <div className="admin-order-controls">
        <input
          type="text"
          placeholder="Search orders (ID, name, email, address, phone)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="admin-search-input"
        />
        <select
          value={selectedStatusFilter}
          onChange={(e) => setSelectedStatusFilter(e.target.value)}
          className="admin-status-filter"
        >
          <option value="All">All</option>
          {orderStatuses.map(status => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
      </div>

      {filteredOrders.length === 0 ? (
        <p className="no-orders-message">No orders found matching your criteria.</p>
      ) : (
        <div className="orders-list">
          {filteredOrders.map(order => ( // --- CHANGED: Map over filteredOrders ---
            <div key={order.id} className="order-card">
              <div className="order-header">
                <h3>Order ID: {order.id}</h3>
                <span className={`order-status status-${order.status.toLowerCase().replace(/\s/g, '-')}`}>
                  {order.status || "Status Not Set"}
                </span>
              </div>
              <div className="order-details">
                <p><strong>Customer:</strong> {order.deliveryAddress?.firstName} {order.deliveryAddress?.lastName} ({order.deliveryAddress?.email})</p>
                <p><strong>Phone:</strong> {order.deliveryAddress?.phoneNumber || 'N/A'}</p>
                <p><strong>Delivery Address:</strong> {order.deliveryAddress?.houseBuildingName}, {order.deliveryAddress?.street}, {order.deliveryAddress?.suburb}, {order.deliveryAddress?.city}, {order.deliveryAddress?.state}, {order.deliveryAddress?.zipCode}, {order.deliveryAddress?.country}</p>
                <p><strong>Order Date:</strong> {formatDate(order.createdAt)}</p>
                <p><strong>Total Amount:</strong> ₱{formatCurrency(order.totalAmount)}</p>
              </div>

              <div className="order-items-section">
                <h4>Items:</h4>
                <div className="order-items-grid">
                  <span className="item-header">Image</span>
                  <span className="item-header">Name</span>
                  <span className="item-header">Price</span>
                  <span className="item-header">Qty</span>
                  <span className="item-header">Subtotal</span>
                  {Array.isArray(order.items) && order.items.map((item, itemIndex) => (
                    <React.Fragment key={itemIndex}>
                      <img src={item.image || "https://placehold.co/50x50/E0E7FF/4F46E5?text=No+Image"} alt={item.name} className="order-item-image" />
                      <span>{item.name}</span>
                      <span>₱{formatCurrency(item.price)}</span>
                      <span>{item.quantity}</span>
                      <span>₱{formatCurrency(item.price * item.quantity)}</span>
                    </React.Fragment>
                  ))}
                </div>
              </div>

              <div className="order-actions">
                <label htmlFor={`status-${order.id}`}>Update Status:</label>
                <select
                  id={`status-${order.id}`}
                  value={order.status || "Pending"}
                  onChange={(e) => handleStatusChange(order.id, e.target.value)}
                  className="status-dropdown"
                >
                  {orderStatuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Order;