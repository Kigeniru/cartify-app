import React, { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase'; // Adjust path if your firebase.js is in a different location
import { toast } from 'react-toastify'; // Optional: for user feedback on loading/error

// Main ProductCare component for Leche Flan
const ProductCare = () => {
    const [productCareContent, setProductCareContent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProductCare = async () => {
            setLoading(true);
            setError(null);
            try {
                // Reference the 'productCare' document within the 'staticPages' collection
                const docRef = doc(db, 'staticPages', 'productCare');
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setProductCareContent(docSnap.data());
                    console.log("Fetched product care data:", docSnap.data()); // For debugging
                } else {
                    console.log("No 'productCare' document found in 'staticPages' collection!");
                    setProductCareContent(null); // Explicitly set null if document doesn't exist
                    toast.warn("Product care information is not available yet.");
                }
            } catch (err) {
                console.error("Error fetching product care content:", err);
                setError("Failed to load product care information.");
                toast.error("Failed to load product care information. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchProductCare();
    }, []); // Empty dependency array means this runs once on component mount

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center p-4 font-inter">
                <p className="text-xl text-gray-600">Loading product care information...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center p-4 font-inter">
                <p className="text-xl text-red-600">{error}</p>
            </div>
        );
    }

    // If no content is found after loading, display a message
    if (!productCareContent) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center p-4 font-inter">
                <p className="text-xl text-gray-600">No product care information available.</p>
            </div>
        );
    }

    // Destructure content for easier access
    const { introText, sections, closingRemark } = productCareContent;

    return (
        <div className="min-h-screen bg-white flex items-center justify-center p-4 font-inter">
            {/* Container for the product care information */}
            <div className="p-8 md:p-12 max-w-3xl w-full">
                {/* Title Section (can remain static or be fetched if needed) */}
                <h1 className="text-4xl md:text-5xl font-bold text-center text-gray-800 mb-8 leading-tight">
                    Product Care
                </h1>

                {/* Introduction - Render only if introText exists */}
                {introText && (
                    <p className="text-lg md:text-xl text-center text-gray-700 mb-10 max-w-2xl mx-auto">
                        {introText}
                    </p>
                )}

                {/* Care Sections - Render only if sections exist and have content */}
                {sections && sections.length > 0 && (
                    <div className="space-y-10">
                        {sections.map((section, index) => (
                            <div
                                key={section.id || index} // Use section.id if available, otherwise index
                                className={`p-6 rounded-lg shadow-md border
                                    ${index % 3 === 0 ? 'bg-purple-50 border-purple-200' :
                                      index % 3 === 1 ? 'bg-pink-50 border-pink-200' :
                                      'bg-green-50 border-green-200'}` // Dynamic background/border color
                                }
                            >
                                {/* Section Title */}
                                {section.title && (
                                    <h2 className={`text-2xl md:text-3xl font-bold mb-4 flex items-center
                                        ${index % 3 === 0 ? 'text-purple-700' :
                                          index % 3 === 1 ? 'text-pink-700' :
                                          'text-green-700'}`
                                    }>
                                        <span className="mr-3 text-3xl"></span> {section.title}
                                    </h2>
                                )}

                                {/* Section Points */}
                                {section.points && section.points.length > 0 && (
                                    <ul className="list-disc list-inside text-gray-800 text-lg space-y-3">
                                        {section.points.map((point, pIndex) => (
                                            point.text && ( // Only render if point.text has content
                                                <li key={pIndex}>
                                                    {point.text}
                                                </li>
                                            )
                                        ))}
                                    </ul>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Closing remark - Render only if closingRemark exists */}
                {closingRemark && (
                    <p className="text-center text-gray-600 mt-10 text-md md:text-lg">
                        {closingRemark}
                    </p>
                )}
            </div>
        </div>
    );
};

export default ProductCare;