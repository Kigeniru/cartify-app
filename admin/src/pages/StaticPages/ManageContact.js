import React, { useState, useEffect } from 'react';
import { FaEdit, FaSave, FaTimes } from 'react-icons/fa'; // Assuming you have FaSave and FaTimes
import './GeneralEditorStyle.css'; // Reusing the same CSS for consistent styling

const ContactForm = ({ content, onSave }) => {
    const [formData, setFormData] = useState({
        companyDescription: '',
        email: '',
        contactNumber: '',
        updatedAt: null
    });

    const [displayedContent, setDisplayedContent] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        if (content) {
            // Ensure all fields are present from content or default to empty string
            const transformedContent = {
                companyDescription: content.companyDescription ?? '',
                email: content.email ?? '',
                contactNumber: content.contactNumber ?? '',
                updatedAt: content.updatedAt || null
            };
            setFormData(transformedContent);
            setDisplayedContent(transformedContent); // Set for display mode
            setIsEditing(false); // Start in display mode if content exists
        } else {
            // Default content for a new Contact Info, start in editing mode
            const defaultContent = {
                companyDescription: 'We are dedicated to providing excellent service. Feel free to reach out to us with any questions or concerns.',
                email: 'support@example.com',
                contactNumber: '+1 (555) 123-4567',
                updatedAt: null
            };
            setFormData(defaultContent);
            setDisplayedContent(null); // No content to display yet
            setIsEditing(true); // Start directly in editing mode to allow initial entry
        }
    }, [content]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const now = new Date();
        const savedData = {
            ...JSON.parse(JSON.stringify(formData)), // Deep copy to prevent reference issues
            updatedAt: now
        };
        setDisplayedContent(savedData);
        setIsEditing(false);
        onSave(savedData); // Pass the updated data to the parent handler
    };

    const handleCancel = () => {
        if (displayedContent) {
            // Revert to the last saved/fetched content
            setFormData(JSON.parse(JSON.stringify(displayedContent)));
        } else {
            // Revert to initial default state if no content was ever displayed
            setFormData({
                companyDescription: 'We are dedicated to providing excellent service. Feel free to reach out to us with any questions or concerns.',
                email: 'support@example.com',
                contactNumber: '+1 (555) 123-4567',
                updatedAt: null
            });
        }
        setIsEditing(false);
    };

    const startEditing = () => {
        // When starting edit, ensure formData matches displayedContent
        if (displayedContent) {
            setFormData(JSON.parse(JSON.stringify(displayedContent)));
        }
        setIsEditing(true);
    };

    const formatTimestamp = (timestamp) => {
        if (!timestamp) return 'Never';

        let date;
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
        // Check if there's any meaningful content to render
        const hasContent = contentToRender && (
            contentToRender.companyDescription ||
            contentToRender.email ||
            contentToRender.contactNumber
        );

        if (!hasContent) {
            return <p className="general-editor-form__no-content-message">No contact information available. Click 'Edit Content' to add/modify.</p>;
        }

        return (
            <div className="general-editor-form__display-mode">
                <h2 className="general-editor-form__display-header">Contact Information</h2>
                {contentToRender.updatedAt && (
                    <div className="general-editor-form__timestamp-container">
                        <p className="general-editor-form__last-updated">
                            Last Updated: {formatTimestamp(contentToRender.updatedAt)}
                        </p>
                    </div>
                )}
                <div className="general-editor-form__display-section">
                    <h3 className="general-editor-form__display-section-title">Company Description:</h3>
                    <p className="general-editor-form__display-text">
                        {contentToRender.companyDescription || 'N/A'}
                    </p>
                </div>
                <div className="general-editor-form__display-section">
                    <h3 className="general-editor-form__display-section-title">Email:</h3>
                    <p className="general-editor-form__display-text">
                        {contentToRender.email || 'N/A'}
                    </p>
                </div>
                <div className="general-editor-form__display-section">
                    <h3 className="general-editor-form__display-section-title">Contact Number:</h3>
                    <p className="general-editor-form__display-text">
                        {contentToRender.contactNumber || 'N/A'}
                    </p>
                </div>
            </div>
        );
    };

    return (
        <div className="general-editor-form-container">
            {!isEditing ? (
                <>
                    <button onClick={startEditing} className="general-editor-form__edit-button">
                        <FaEdit className="icon-margin-right" />
                        {displayedContent ? 'Edit Content' : 'Add New Content'}
                    </button>
                    {renderContent(displayedContent)}
                </>
            ) : (
                <form onSubmit={handleSubmit} className="general-editor-form">
                    {/* Company Description */}
                    <div className="general-editor-form__intro-text-group">
                        <label htmlFor="companyDescription" className="general-editor-form__label">
                            Company Description
                        </label>
                        <textarea
                            id="companyDescription"
                            name="companyDescription" // Use name prop for consistent handleChange
                            rows="8"
                            className="general-editor-form__textarea"
                            value={formData.companyDescription}
                            onChange={handleChange}
                            placeholder="Enter a brief description of your company for the contact page."
                        ></textarea>
                    </div>

                    {/* Email */}
                    <div className="general-editor-form__input-group">
                        <label htmlFor="email" className="general-editor-form__label">
                            Email
                        </label>
                        <input
                            id="email"
                            name="email" // Use name prop
                            type="email"
                            className="general-editor-form__input"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="e.g., support@yourcompany.com"
                        />
                    </div>

                    {/* Contact Number */}
                    <div className="general-editor-form__input-group">
                        <label htmlFor="contactNumber" className="general-editor-form__label">
                            Contact Number
                        </label>
                        <input
                            id="contactNumber"
                            name="contactNumber" // Use name prop
                            type="text"
                            className="general-editor-form__input"
                            value={formData.contactNumber}
                            onChange={handleChange}
                            placeholder="e.g., +1 (555) 123-4567"
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="general-editor-form__actions">
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="general-editor-form__action-btn general-editor-form__cancel-btn"
                        >
                             Cancel
                        </button>
                        <button
                            type="submit"
                            className="general-editor-form__action-btn general-editor-form__save-btn"
                        >
                             Save
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default ContactForm;