import React, { useEffect, useState } from 'react'; // Import useEffect and useState
import './Footer.css';
import { Link } from 'react-router-dom';
import logo from '../../assets/mvillo-logo.png';
import { doc, getDoc } from 'firebase/firestore'; // Import Firestore functions
import { db } from '../../firebase'; // Import your Firebase db instance

const Footer = () => {
    const [contactData, setContactData] = useState({
        companyDescription: 'Loading company description...',
        email: 'Loading email...',
        contactNumber: 'Loading contact number...'
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchContactData = async () => {
            setLoading(true);
            try {
                const docRef = doc(db, 'staticPages', 'contact');
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setContactData({
                        companyDescription: data.companyDescription || 'No description available.',
                        email: data.email || 'No email available.',
                        contactNumber: data.contactNumber || 'No contact number available.'
                    });
                } else {
                    console.warn("No 'contact' document found in 'staticPages' collection.");
                    setContactData({
                        companyDescription: 'Company description not found.',
                        email: 'Email not found.',
                        contactNumber: 'Contact number not found.'
                    });
                }
            } catch (err) {
                console.error("Error fetching contact data for footer:", err);
                setError("Failed to load contact information.");
                setContactData({
                    companyDescription: 'Error loading description.',
                    email: 'Error loading email.',
                    contactNumber: 'Error loading contact number.'
                });
            } finally {
                setLoading(false);
            }
        };

        fetchContactData();
    }, []); // Empty dependency array means this runs once on component mount

    return (
        <div className='footer' id='footer'>
            <div className="footer-content">
                <div className="footer-content-left">
                    <img src={logo} alt="Mvillo Logo" className='logo' />
                    {loading ? (
                        <p>Loading company description...</p>
                    ) : error ? (
                        <p className="error-message">{error}</p>
                    ) : (
                        <p>{contactData.companyDescription}</p>
                    )}
                </div>

                <div className="footer-content-center">
                    <h2>COMPANY</h2>
                    <ul>
                        <li><Link to="/" className="text-white no-underline transition-all duration-200 hover:text-gray-300 hover:scale-105">Home</Link></li>
                        <li><Link to="/product-care" className="text-white no-underline transition-all duration-200 hover:text-gray-300 hover:scale-105">Product Care</Link></li>
                        <li><Link to="/terms-and-conditions" className="text-white no-underline transition-all duration-200 hover:text-gray-300 hover:scale-105">Terms and Conditions</Link></li>
                        <li><Link to="/privacy-policy" className="text-white no-underline transition-all duration-200 hover:text-gray-300 hover:scale-105">Privacy Policy</Link></li>
                    </ul>
                </div>

                <div className="footer-content-right">
                    <h2> CONTACT US</h2>
                    <ul>
                        {loading ? (
                            <>
                                <li>Loading...</li>
                                <li>Loading...</li>
                            </>
                        ) : error ? (
                            <>
                                <li className="error-message">Error...</li>
                                <li className="error-message">Error...</li>
                            </>
                        ) : (
                            <>
                                <li>{contactData.contactNumber}</li>
                                <li>{contactData.email}</li>
                            </>
                        )}
                    </ul>
                </div>
            </div>

            <hr />
            <p className="footer-copyright">Copyright 2025 Mvillo.com - All Rights Reserved.</p>
        </div>
    )
}

export default Footer;