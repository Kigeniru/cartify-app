import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc } from 'firebase/firestore'; // Import doc if you decide to use it, though getDocs is enough here
import { db } from '../../firebase'; // Assuming your Firebase db instance is exported from here

const TermsAndConditions = () => {
    const [termsContent, setTermsContent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTermsContent = async () => {
            try {
                const docRef = doc(collection(db, 'staticPages'), 'termsAndConditions');
                const docSnap = await getDocs(collection(db, 'staticPages')); // Fetch all documents in 'staticPages'
                
                let fetchedData = null;
                docSnap.forEach((doc) => {
                    if (doc.id === 'termsAndConditions') {
                        fetchedData = doc.data();
                    }
                });

                if (fetchedData) {
                    setTermsContent(fetchedData);
                } else {
                    // Set a default empty structure if no data exists
                    setTermsContent({
                        introText: '',
                        sections: [],
                        closingRemark: '',
                        updatedAt: null // Initialize with null if no data
                    });
                    console.warn("No 'termsAndConditions' document found in Firebase.");
                }
            } catch (err) {
                console.error("Error fetching Terms and Conditions:", err);
                setError("Failed to load Terms and Conditions. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchTermsContent();
    }, []); // Empty dependency array means this runs once on mount

    const formatTimestamp = (timestamp) => {
        if (!timestamp) return 'Never';

        let date;
        // Check if it's a Firebase Timestamp object
        if (timestamp && typeof timestamp.toDate === 'function') {
            date = timestamp.toDate();
        } else if (typeof timestamp === 'string' && !isNaN(new Date(timestamp).getTime())) {
            // If it's an ISO string or a string that can be parsed
            date = new Date(timestamp);
        } else if (timestamp instanceof Date) {
            // If it's already a Date object
            date = timestamp;
        } else {
            console.warn("Unexpected timestamp format:", timestamp);
            return 'Invalid Date';
        }

        if (isNaN(date.getTime())) {
            return 'Invalid Date';
        }

        // Format to match "July 1, 2025 at 6:36:30 PM UTC+8" or similar
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
            timeZoneName: 'shortOffset' // e.g., UTC+8
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6 font-inter">
                <p className="text-xl text-gray-700">Loading Terms and Conditions...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6 font-inter">
                <p className="text-xl text-red-600">{error}</p>
            </div>
        );
    }

    // If no content is loaded or it's an empty structure from Firebase
    if (!termsContent || (termsContent.introText === '' && termsContent.sections.length === 0 && termsContent.closingRemark === '')) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6 font-inter">
                <p className="text-xl text-gray-700">No Terms and Conditions content available yet.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-6 font-inter">
            {/* Container for the terms and conditions information */}
            <div className="p-8 md:p-12 max-w-4xl w-full">
                {/* Title Section */}
                <h1 className="text-4xl md:text-5xl font-bold text-center text-gray-800 mb-8 leading-tight">
                    Terms and Conditions
                </h1>

                {/* Last Updated */}
                {termsContent.updatedAt && (
                    <p className="text-center text-gray-500 mt-0 mb-8 text-md md:text-lg">
                        Last updated: {formatTimestamp(termsContent.updatedAt)}
                    </p>
                )}

                {/* Introduction */}
                {termsContent.introText && (
                    <p className="text-lg md:text-xl text-justify text-gray-600 mb-10 max-w-2xl mx-auto">
                        {termsContent.introText}
                    </p>
                )}

                {/* Policy Sections */}
                <div className="space-y-8 text-gray-700">
                    {termsContent.sections && termsContent.sections.map((section, index) => (
                        <div key={section.id || index} className="bg-gray-100 p-6 rounded-md border border-gray-200">
                            {section.title && (
                                <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-4">
                                    {section.title}
                                </h2>
                            )}
                            {section.points && section.points.length > 0 ? (
                                <ul className="list-disc list-inside text-lg space-y-2 pl-4">
                                    {section.points.map((point, pIndex) => (
                                        point.text && (
                                            <li key={pIndex}>
                                                {point.bold ? <strong className="text-gray-700">{point.bold}:</strong> : ''}
                                                {point.text}
                                            </li>
                                        )
                                    ))}
                                </ul>
                            ) : (
                                // Render plain text if no points or if it's just one point without list formatting
                                section.points && section.points[0]?.text && (
                                    <p className="text-lg text-justify">{section.points[0].text}</p>
                                )
                            )}
                        </div>
                    ))}
                </div>

                {/* Closing remark */}
                {termsContent.closingRemark && (
                    <p className="text-center text-gray-500 mt-10 text-md md:text-lg">
                        {termsContent.closingRemark}
                    </p>
                )}
            </div>
        </div>
    );
};

export default TermsAndConditions;