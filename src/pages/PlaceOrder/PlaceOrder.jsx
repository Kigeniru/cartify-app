import React, { useContext } from 'react';
import './PlaceOrder.css';
import { StoreContext } from '../Cart/StoreContext';

const PlaceOrder = () => {

    const { getTotalCartAmount } = useContext(StoreContext);

    // This function will handle the payment process using native fetch API
    const handlePayment = async (e) => {
        // Prevent the form from submitting and reloading the page
        e.preventDefault(); 

        // Step 1: Calculate the total amount in centavos (lowest currency denomination).
        // Paymongo requires the amount to be multiplied by 100.
        const totalAmountInCentavos = (getTotalCartAmount() + 60) * 100;
        
        // Define your Paymongo Secret Key.
        // NOTE: In a real production app, this should be handled on a backend server for security.
        // Exposing it in the frontend is a security risk.
        const SECRET_KEY = 'sk_test_FJtrQAYD82Jp8B1uMA37qYFr';
        
        // Encode the secret key for Basic Authentication (username:password -> sk_test_...: )
        const basicAuth = btoa(SECRET_KEY + ':');

        // --- Step 2: Define your success and cancel redirect URLs ---
        // We use window.location.origin to make the URLs dynamic, so they work in both
        // development (e.g., http://localhost:3000) and production (e.g., https://yourdomain.com).
        // Replace '/complete' with the path to your order confirmation page.
        // Replace '/cart' with the path to your cart/checkout page for cancellation.
        const successRedirectUrl = `${window.location.origin}/complete`; // Example: Your order complete page
        const cancelRedirectUrl = `${window.location.origin}/cart`;     // Example: Redirect back to the cart

        // Step 3: Make the API call to Paymongo using fetch.
        try {
            const response = await fetch('https://api.paymongo.com/v1/links', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    // Use the encoded key for Authorization
                    'Authorization': `Basic ${basicAuth}`
                },
                // The request body must be a JSON string.
                body: JSON.stringify({
                    data: {
                        attributes: {
                            amount: totalAmountInCentavos, 
                            description: 'Online Food Order', 
                            remarks: 'Order from Cartify App',
                            // --- Add the redirect URLs here ---
                            success_url: successRedirectUrl,
                            cancel_url: cancelRedirectUrl
                        }
                    }
                })
            });

            // Parse the JSON response
            const data = await response.json();

            // Step 4: Check if the response was successful (HTTP status 200-299).
            if (response.ok) {
                console.log("Paymongo Link created successfully:", data);
                
                // Step 5: Redirect the user to the Paymongo checkout page.
                // Paymongo will handle the final redirect back to your site from there.
                if (data.data.attributes.checkout_url) {
                    window.location.href = data.data.attributes.checkout_url;
                } else {
                    console.error("No checkout URL found in the response.", data);
                    alert("Failed to get payment link. Please check the console for details.");
                }
            } else {
                // If the response is not OK (e.g., 401 Unauthorized, 400 Bad Request)
                console.error("Paymongo API Error:", data.errors);
                alert(`Payment processing failed. Error: ${data.errors?.[0]?.detail || 'Unknown error'}`);
            }

        } catch (err) {
            // This catches network errors (e.g., no internet connection).
            console.error("Network or Unexpected Error:", err);
            alert("Payment processing failed due to a network error. Please try again.");
        }
    };

    return (
        <form className='place-order' onSubmit={handlePayment}>
            <div className="place-order-left">
                <p className="title">Delivery Information</p>
                <div className="multi-fields">
                    <input type="text" placeholder='First Name' required />
                    <input type="text" placeholder='Last Name' required />
                </div>
                <input type="email" placeholder='Email Address' required />
                <input type="text" placeholder='Street' required />
                <div className="multi-fields">
                    <input type="text" placeholder='City' required />
                    <input type="text" placeholder='State' required />
                </div>
                <div className="multi-fields">
                    <input type="text" placeholder='Zip Code' required />
                    <input type="text" placeholder='Country' required />
                </div>
                <input type="text" placeholder='Phone Number' required />
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