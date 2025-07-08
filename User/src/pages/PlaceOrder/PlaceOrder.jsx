import React, { useContext, useEffect, useState } from 'react';
import './PlaceOrder.css';
import { StoreContext } from '../Cart/StoreContext';
import { auth, db } from '../../firebase';
import { doc, getDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const PlaceOrder = () => {
    const { getTotalCartAmount, cartItems, food_list, clearCart } = useContext(StoreContext);
    const [userDetails, setUserDetails] = useState(null);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        houseBuildingName: '',
        street: '',
        suburb: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
        phoneNumber: ''
    });

    const navigate = useNavigate();

    // Helper function for currency formatting
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP', // Philippine Peso
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);
    };

    // --- Function to fetch user data from Firestore ---
    const fetchUserProfile = async (user) => {
        if (!user) {
            setUserDetails(null);
            setLoadingProfile(false);
            return;
        }
        try {
            const docRef = doc(db, "Users", user.uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                setUserDetails(data);

                const deliveryComponents = data.deliveryInfo?.components || {};

                setFormData({
                    firstName: data.firstName || '',
                    lastName: data.lastName || '',
                    email: user.email || '',
                    houseBuildingName: deliveryComponents.name || deliveryComponents.building || '',
                    street: deliveryComponents.road || '',
                    suburb: deliveryComponents.suburb || deliveryComponents.neighbourhood || '',
                    city: deliveryComponents.city || deliveryComponents.town || deliveryComponents.village || '',
                    state: deliveryComponents.state || '',
                    zipCode: deliveryComponents.postcode || '',
                    country: deliveryComponents.country || '',
                    phoneNumber: data.contactInfo || ''
                });
            } else {
                console.log("User data not found in Firestore. Filling email.");
                setUserDetails(null);
                setFormData(prev => ({ ...prev, email: user.email || '' }));
            }
        } catch (error) {
            console.error("Error fetching user profile:", error);
        } finally {
            setLoadingProfile(false);
        }
    };

    // --- useEffect to listen for auth state changes and fetch profile ---
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            fetchUserProfile(user);
        });
        return () => unsubscribe();
    }, []);

    // --- Handle input changes for the form fields ---
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // This function will handle the payment process and order saving
    const handlePayment = async (e) => {
        e.preventDefault();

        if (getTotalCartAmount() === 0) {
            alert("Your cart is empty. Please add items before proceeding to payment.");
            return;
        }

        if (!auth.currentUser) {
            alert("Please sign in to place an order.");
            return;
        }

        const userId = auth.currentUser.uid;
        const orderItems = [];

        // Construct order items from cartItems and food_list (products)
        for (const itemId in cartItems) {
            if (cartItems[itemId] > 0) {
                const itemInfo = food_list.find((product) => product.id === itemId);
                if (itemInfo) {
                    orderItems.push({
                        id: itemId,
                        name: itemInfo.name,
                        price: itemInfo.price,
                        quantity: cartItems[itemId],
                        image: itemInfo.imageUrl,
                    });
                }
            }
        }

        if (orderItems.length === 0) {
            alert("Your cart is empty. Cannot place an order.");
            return;
        }

        const orderData = {
            userId: userId,
            items: orderItems,
            totalAmount: getTotalCartAmount() + (getTotalCartAmount() === 0 ? 0 : 60), // Subtotal + Delivery Fee
            deliveryAddress: formData,
            paymentMethod: 'Paymongo Link',
            status: 'Pending', // Initial status
            createdAt: serverTimestamp()
        };

        try {
            // 1. Save order to Firestore
            const docRef = await addDoc(collection(db, "orders"), orderData);
            const orderId = docRef.id;
            console.log("Order saved to Firestore with ID:", orderId);

            // 2. Clear the cart AFTER successfully saving the order
            clearCart();

            // 3. Redirect the current tab to the OrderStatus page
            //    Passing orderId in state so OrderStatus page can fetch its details.
            navigate('/order', { state: { orderId: orderId } }); // ADDED THIS LINE

            // 4. Proceed with Paymongo payment link creation (opens in new tab)
            const totalAmountInCentavos = (getTotalCartAmount() + (getTotalCartAmount() === 0 ? 0 : 60)) * 100;
            const SECRET_KEY = 'sk_test_FJtrQAYD82Jp8B1uMA37qYFr'; // Ensure this is securely handled in production
            const basicAuth = btoa(SECRET_KEY + ':');

            const successRedirectUrl = `${window.location.origin}/complete?orderId=${orderId}&status=success`;
            const cancelRedirectUrl = `${window.location.origin}/cart?orderId=${orderId}&status=cancelled`;

            const response = await fetch('https://api.paymongo.com/v1/links', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Basic ${basicAuth}`
                },
                body: JSON.stringify({
                    data: {
                        attributes: {
                            amount: totalAmountInCentavos,
                            description: `Order #${orderId} from Cartify App`,
                            remarks: `User: ${auth.currentUser.email}`,
                            success_url: successRedirectUrl,
                            cancel_url: cancelRedirectUrl,
                        }
                    }
                })
            });

            const data = await response.json();

            if (response.ok) {
                console.log("Paymongo Link created successfully:", data);
                if (data.data.attributes.checkout_url) {
                    window.open(data.data.attributes.checkout_url, '_blank');
                    // Optionally, you might want to show a toast/notification here
                    // to inform the user that a new tab has opened for payment.
                } else {
                    console.error("No checkout URL found in the Paymongo response.", data);
                    alert("Failed to get payment link. Please try again or contact support.");
                }
            } else {
                console.error("Paymongo API Error:", data.errors);
                alert(`Payment link creation failed: ${data.errors?.[0]?.detail || 'Unknown error'}`);
            }

        } catch (err) {
            console.error("Error saving order or processing payment:", err);
            alert("An error occurred while placing your order. Please try again.");
        }
    };

    if (loadingProfile) {
        return (
            <div className="place-order-loading text-center p-8">
                <p>Loading delivery information...</p>
            </div>
        );
    }

    return (
        <form className='place-order' onSubmit={handlePayment}>
            <div className="place-order-left">
                <p className="title">Delivery Information</p>
                <div className="multi-fields">
                    <input
                        type="text"
                        placeholder='First Name'
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                    />
                    <input
                        type="text"
                        placeholder='Last Name'
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <input
                    type="email"
                    placeholder='Email Address'
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    readOnly
                />
                <input
                    type="text"
                    placeholder='House/Building Name'
                    name="houseBuildingName"
                    value={formData.houseBuildingName}
                    onChange={handleInputChange}
                />
                <input
                    type="text"
                    placeholder='Street'
                    name="street"
                    value={formData.street}
                    onChange={handleInputChange}
                    required
                />
                <input
                    type="text"
                    placeholder='Suburb'
                    name="suburb"
                    value={formData.suburb}
                    onChange={handleInputChange}
                />
                <div className="multi-fields">
                    <input
                        type="text"
                        placeholder='City'
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                    />
                    <input
                        type="text"
                        placeholder='State'
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div className="multi-fields">
                    <input
                        type="text"
                        placeholder='Zip Code'
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        required
                    />
                    <input
                        type="text"
                        placeholder='Country'
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <input
                    type="text"
                    placeholder='Phone Number'
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    required
                />
            </div>
            <div className="place-order-right">
                <div className="cart-total">
                    <h2>Cart Totals</h2>
                    <div>
                        <div className="cart-total-details">
                            <p>Subtotal</p>
                            <p>{formatCurrency(getTotalCartAmount())}</p>
                        </div>
                        <hr />
                        <div className="cart-total-details">
                            <p>Delivery Fee</p>
                            <p>{formatCurrency(getTotalCartAmount() === 0 ? 0 : 60)}</p>
                        </div>
                        <hr />
                        <div className="cart-total-details">
                            <b>Total</b>
                            <b>{formatCurrency(getTotalCartAmount() === 0 ? 0 : getTotalCartAmount() + 60)}</b>
                        </div>
                    </div>
                    <button type="submit">PROCEED TO PAYMENT</button>
                </div>
            </div>
        </form>
    );
};

export default PlaceOrder;