import React, { useContext, useEffect, useState } from 'react';
import './PlaceOrder.css';
import { StoreContext } from '../Cart/StoreContext';
import { auth, db } from '../../firebase';
import { doc, getDoc } from 'firebase/firestore';

const PlaceOrder = () => {
    const { getTotalCartAmount } = useContext(StoreContext);
    const [userDetails, setUserDetails] = useState(null);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        houseBuildingName: '', // New field for House/Building Name
        street: '',
        suburb: '',            // New field for Suburb
        city: '',
        state: '',
        zipCode: '',
        country: '',
        phoneNumber: ''
    });

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

                // Extract structured delivery info
                const deliveryComponents = data.deliveryInfo?.components || {}; // Get components or empty object

                setFormData({
                    firstName: data.firstName || '',
                    lastName: data.lastName || '',
                    email: user.email || '',
                    // Prioritize house_number, then building for houseBuildingName
                    houseBuildingName: deliveryComponents.name || deliveryComponents.building || '',
                    street: deliveryComponents.road || '',
                    // Prioritize suburb, then neighbourhood for suburb
                    suburb: deliveryComponents.suburb || deliveryComponents.neighbourhood || '',
                    city: deliveryComponents.city || deliveryComponents.town || deliveryComponents.village || '',
                    state: deliveryComponents.state || '',
                    zipCode: deliveryComponents.postcode || '',
                    country: deliveryComponents.country || '',
                    phoneNumber: data.contactInfo || ''
                });
            } else {
                console.log("User data not found in Firestore.");
                setUserDetails(null);
                setFormData(prev => ({ ...prev, email: user.email || '' }));
            }
        } catch (error) {
            console.error("Error fetching user profile:", error);
            // Optionally show a toast error here
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

    // This function will handle the payment process using native fetch API
    const handlePayment = async (e) => {
        e.preventDefault();

        console.log("Delivery Information:", formData);

        const totalAmountInCentavos = (getTotalCartAmount() + 60) * 100;

        const SECRET_KEY = 'sk_test_FJtrQAYD82Jp8B1uMA37qYFr';
        const basicAuth = btoa(SECRET_KEY + ':');

        const successRedirectUrl = `${window.location.origin}/complete`;
        const cancelRedirectUrl = `${window.location.origin}/cart`;

        try {
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
                            description: 'Online Food Order',
                            remarks: 'Order from Cartify App',
                            success_url: successRedirectUrl,
                            cancel_url: cancelRedirectUrl,
                            // You can pass customer details here if Paymongo supports it
                            // based on the formData
                            // customer_details: {
                            //     email: formData.email,
                            //     first_name: formData.firstName,
                            //     last_name: formData.lastName,
                            //     phone: formData.phoneNumber,
                            //     shipping: {
                            //         address: {
                            //             line1: formData.street,
                            //             line2: formData.houseBuildingName, // Potentially use for line2
                            //             city: formData.city,
                            //             state: formData.state,
                            //             postal_code: formData.zipCode,
                            //             country: formData.country,
                            //         },
                            //         name: `${formData.firstName} ${formData.lastName}`,
                            //     }
                            // }
                        }
                    }
                })
            });

            const data = await response.json();

            if (response.ok) {
                console.log("Paymongo Link created successfully:", data);
                if (data.data.attributes.checkout_url) {
                    window.location.href = data.data.attributes.checkout_url;
                } else {
                    console.error("No checkout URL found in the response.", data);
                    console.log("Failed to get payment link. Please check the console for details.");
                }
            } else {
                console.error("Paymongo API Error:", data.errors);
                console.log(`Payment processing failed. Error: ${data.errors?.[0]?.detail || 'Unknown error'}`);
            }

        } catch (err) {
            console.error("Network or Unexpected Error:", err);
            console.log("Payment processing failed due to a network error. Please try again.");
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
                    placeholder='House/Building Name' // New input field
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
                    placeholder='Suburb' // New input field
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
                            <p>₱{getTotalCartAmount().toFixed(2)}</p>
                        </div>
                        <hr />
                        <div className="cart-total-details">
                            <p>Delivery Fee</p>
                            <p>₱{getTotalCartAmount() === 0 ? 0 : 60}</p>
                        </div>
                        <hr />
                        <div className="cart-total-details">
                            <b>Total</b>
                            <b>₱{(getTotalCartAmount() === 0 ? 0 : getTotalCartAmount() + 60).toFixed(2)}</b>
                        </div>
                    </div>
                    <button type="submit">PROCEED TO PAYMENT</button>
                </div>
            </div>
        </form>
    );
};

export default PlaceOrder;
