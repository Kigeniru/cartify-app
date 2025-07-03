import React, { useEffect, useState } from 'react';
import './StaticPages.css';
import { collection, getDocs, setDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import ManageContact from './ManageContact';
import ProductCareForm from './ProductCareForm';
import TermsAndConditionsForm from './TermsAndConditionsForm';
import PrivacyPolicyForm from './PrivacyPolicyForm';


import ConfirmModal from '../../components/ConfirmModal/ConfirmModal';


const StaticPages = () => {
    const [activeTab, setActiveTab] = useState('Contact');
    const [pageContent, setPageContent] = useState({});

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const tabs = ['Contact', 'Product Care', 'Privacy Policy', 'Terms and Conditions'];

    const tabToDocIdMap = {
        'Contact': 'contact',
        'Product Care': 'productCare',
        'Privacy Policy': 'privacyPolicy',
        'Terms and Conditions': 'termsAndConditions'
    };

    useEffect(() => {
        const fetchStaticPageContent = async () => {
            setLoading(true);
            setError(null);
            try {
                const querySnapshot = await getDocs(collection(db, 'staticPages'));
                const contentMap = {};
                querySnapshot.docs.forEach(doc => {
                    contentMap[doc.id] = doc.data();
                });
                setPageContent(contentMap);
            } catch (err) {
                console.error("Error fetching static page content:", err);
                setError("Failed to load page content.");
                toast.error("Failed to load static page content.");
            } finally {
                setLoading(false);
            }
        };
        fetchStaticPageContent();
    }, []);

    const handleSave = async (docId, updatedData) => {
        try {
            const pageRef = doc(db, 'staticPages', docId);
            console.log(`Attempting to save for docId: ${docId}`);
            console.log("Data to update:", updatedData);

            // Using setDoc with merge: true will either create the document
            // or update existing fields without overwriting the entire document.
            await setDoc(pageRef, updatedData, { merge: true });

            // Update the local state to reflect the saved data
            setPageContent(prev => ({
                ...prev,
                [docId]: { ...prev[docId], ...updatedData }
            }));

            toast.success(`${tabs.find(key => tabToDocIdMap[key] === docId)} content updated successfully!`);
        } catch (err) {
            console.error(`Error updating ${docId} content:`, err);
            toast.error(`Failed to update ${docId} content.`);
        }
    };

    const renderTabContent = () => {
        const docId = tabToDocIdMap[activeTab];
        const currentData = pageContent[docId] || {};

        if (loading) {
            return <div className="tab-content loading-message">Loading content...</div>;
        }

        if (error) {
            return <div className="tab-content error-message">Error: {error}</div>;
        }

        switch (activeTab) {
            case 'Contact':
                return (
                    <ManageContact
                        content={currentData}
                        onSave={(data) => handleSave(docId, data)}
                    />
                );
            case 'Product Care':
                return (
                    <ProductCareForm
                        content={currentData}
                        onSave={(data) => handleSave(docId, data)}
                    />
                );
            case 'Privacy Policy':
                return (
                   <PrivacyPolicyForm
                        content={currentData}
                        onSave={(data) => handleSave(docId, data)}
                    />
                );
            case 'Terms and Conditions':
                return (
                    <TermsAndConditionsForm
                        content={currentData}
                        onSave={(data) => handleSave(docId, data)}
                    />
                );
            default:
                return <p>Select a tab to manage content.</p>;
        }
    };

    return (
        <div className='list add flex-col'>
            <p className='header'>Manage Static Pages</p>
            <hr className="thick-hr" />

            <div className="tabs-container">
                <div className="tabs-nav">
                    {tabs.map((tabName) => (
                        <button
                            key={tabName}
                            className={`tab-button ${activeTab === tabName ? 'active' : ''}`}
                            onClick={() => {
                                setActiveTab(tabName);
                            }}
                        >
                            {tabName}
                        </button>
                    ))}
                </div>
                <div className="tabs-content-wrapper">
                    {renderTabContent()}
                </div>
            </div>

            <ConfirmModal show={false} title="" message="" onConfirm={() => {}} onCancel={() => {}} />
        </div>
    );
};

export default StaticPages;