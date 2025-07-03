import React, { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase'; // Adjust the path as needed

// Main PrivacyPolicy component with a professional design
const PrivacyPolicy = () => {
  const [policyContent, setPolicyContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPrivacyPolicyContent = async () => {
      try {
        setLoading(true);
        setError(null); // Clear previous errors

        // Make sure this path ('staticPages', 'privacyPolicy') matches your Firestore
        const docRef = doc(db, 'staticPages', 'privacyPolicy');
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          // Transform the fetched data to match the expected structure
          const transformedContent = {
            introText: data.introText ?? '',
            sections: data.sections?.map(section => ({
              ...section,
              title: section.title ?? '',
              points: section.points?.map(point => ({
                text: point.text || '' // Assuming points just have 'text'
              })) ?? []
            })) ?? [],
            closingRemark: data.closingRemark ?? '',
            updatedAt: data.updatedAt || null // Keep as Firebase Timestamp if it is
          };
          setPolicyContent(transformedContent);
        } else {
          // If no document exists, set default empty state or a message
          setPolicyContent({
            introText: '',
            sections: [],
            closingRemark: '',
            updatedAt: null
          });
          setError("No privacy policy content found. It might not be set up yet.");
        }
      } catch (err) {
        console.error("Error fetching privacy policy:", err);
        setError("Failed to load privacy policy. Please check your network or Firebase configuration.");
        setPolicyContent(null); // Clear content on error
      } finally {
        setLoading(false);
      }
    };

    fetchPrivacyPolicyContent();
  }, []); // Empty dependency array means this runs once on mount

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Never';

    let date;
    // Check if it's a Firebase Timestamp object
    if (timestamp && typeof timestamp.toDate === 'function') {
      date = timestamp.toDate();
    } else if (typeof timestamp === 'string' && !isNaN(new Date(timestamp).getTime())) {
      date = new Date(timestamp);
    } else if (timestamp instanceof Date) {
      date = timestamp;
    } else {
      console.warn("Unexpected timestamp format:", timestamp);
      return 'Invalid Date';
    }

    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }

    // Format to match your TermsAndConditionsForm output
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
      timeZoneName: 'shortOffset'
    });
  };

  const renderContent = (contentToRender) => {
    // If contentToRender is null or empty after fetching, show a message
    if (!contentToRender || !contentToRender.sections || contentToRender.sections.length === 0 ||
        (contentToRender.introText === '' && contentToRender.closingRemark === '' &&
         contentToRender.sections.every(s => s.title === '' && s.points.every(p => p.text === '')))) {
        return <p className="text-center text-gray-500 text-lg mt-8">No privacy policy information available.</p>;
    }

    return (
      <>
        {contentToRender.introText && (
          <p className="text-lg md:text-xl text-justify text-gray-600 mb-10 max-w-2xl mx-auto">
            {contentToRender.introText}
          </p>
        )}

        <div className="space-y-8 text-gray-700">
          {contentToRender.sections.map((section, index) => (
            <div key={section.id || index} className="bg-gray-100 p-6 rounded-md border border-gray-200">
              {section.title && (
                <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-4">
                  {section.title}
                </h2>
              )}
              <ul className="list-disc list-inside text-lg space-y-2 pl-4">
                {section.points?.map((point, pIndex) => (
                  point.text && <li key={pIndex}>{point.text}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {contentToRender.closingRemark && (
          <p className="text-lg md:text-xl text-justify text-gray-600 mt-10 max-w-2xl mx-auto">
            {contentToRender.closingRemark}
          </p>
        )}
      </>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 font-inter">
      {/* Container for the privacy policy information */}
      <div className="p-8 md:p-12 max-w-4xl w-full">
        {/* Title Section */}
        <h1 className="text-4xl md:text-5xl font-bold text-center text-gray-800 mb-8 leading-tight">
          Privacy Policy
        </h1>

        {/* Last Updated Timestamp */}
        {policyContent?.updatedAt && (
          <p className="text-center text-gray-500 mt-4 mb-8 text-sm md:text-md">
            Last updated: {formatTimestamp(policyContent.updatedAt)}
          </p>
        )}

        {loading ? (
          <div className="text-center text-gray-700 text-xl">Loading Privacy Policy...</div>
        ) : error ? (
          <div className="text-center text-red-600 text-xl">{error}</div>
        ) : (
          renderContent(policyContent)
        )}
      </div>
    </div>
  );
};

export default PrivacyPolicy;