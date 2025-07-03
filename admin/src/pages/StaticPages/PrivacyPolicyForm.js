import React, { useState, useEffect } from 'react';
import { FaPlus, FaTrash, FaEdit } from 'react-icons/fa';
import { v4 as uuidv4 } from 'uuid';
import './GeneralEditorStyle.css'; // Reusing the same CSS for styling

const PrivacyPolicyForm = ({ content, onSave }) => {
    const [formData, setFormData] = useState({
        introText: '',
        sections: [],
        closingRemark: '',
        updatedAt: null
    });

    const [displayedContent, setDisplayedContent] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        if (content) {
            const transformedContent = {
                introText: content.introText ?? '',
                sections: content.sections?.map(section => ({
                    ...section,
                    title: section.title ?? '',
                    // Note: If you expect 'bold' properties in Privacy Policy points, adjust this
                    points: section.points?.map(point => ({
                        text: point.text || '' // Removed bold specific logic as it's less common for Privacy Policy points
                    })) ?? []
                })) ?? [],
                closingRemark: content.closingRemark ?? '',
                updatedAt: content.updatedAt || null
            };
            setFormData(transformedContent);
            setDisplayedContent(transformedContent);
            setIsEditing(false); // Display existing content by default
        } else {
            // Default content for a new Privacy Policy
            const defaultContent = {
                introText: 'This Privacy Policy describes how your personal information is collected, used, and shared when you visit or make a purchase from Mvillo.',
                sections: [
                    {
                        id: uuidv4(),
                        title: '1. Information We Collect',
                        points: [{ text: 'We collect various types of information in connection with the services we provide, including information you provide directly to us.' }]
                    },
                    {
                        id: uuidv4(),
                        title: '2. How We Use Your Information',
                        points: [{ text: 'We use the information we collect to provide, maintain, and improve our services, process your orders, and communicate with you.' }]
                    },
                    {
                        id: uuidv4(),
                        title: '3. Sharing Your Personal Information',
                        points: [{ text: 'We do not sell, trade, or otherwise transfer to outside parties your Personally Identifiable Information unless we provide users with advance notice.' }]
                    },
                    {
                        id: uuidv4(),
                        title: '4. Data Security',
                        points: [{ text: 'We implement a variety of security measures to maintain the safety of your personal information when you place an order or enter, submit, or access your personal information.' }]
                    }
                ],
                closingRemark: 'By using our site, you consent to our Privacy Policy.',
                updatedAt: null // Default for new content
            };
            setFormData(defaultContent);
            setDisplayedContent(null);
            setIsEditing(true); // Enter editing mode if no content exists
        }
    }, [content]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSectionTitleChange = (index, value) => {
        const newSections = [...formData.sections];
        newSections[index].title = value;
        setFormData(prev => ({ ...prev, sections: newSections }));
    };

    const handlePointChange = (sectionIndex, pointIndex, value) => {
        const newSections = [...formData.sections];
        newSections[sectionIndex].points[pointIndex].text = value;
        setFormData(prev => ({ ...prev, sections: newSections }));
    };

    const addPoint = (sectionIndex) => {
        const newSections = [...formData.sections];
        newSections[sectionIndex].points.push({ text: '' });
        setFormData(prev => ({ ...prev, sections: newSections }));
    };

    const removePoint = (sectionIndex, pointIndex) => {
        const newSections = [...formData.sections];
        if (newSections[sectionIndex].points.length > 1) {
            newSections[sectionIndex].points.splice(pointIndex, 1);
            setFormData(prev => ({ ...prev, sections: newSections }));
        } else {
            alert("Each section must have at least one point.");
        }
    };

    const addSection = () => {
        setFormData(prev => ({
            ...prev,
            sections: [
                ...prev.sections,
                {
                    id: uuidv4(),
                    title: '',
                    points: [{ text: '' }]
                }
            ]
        }));
    };

    const removeSection = (sectionIndex) => {
        const newSections = [...formData.sections];
        if (newSections.length > 1) {
            newSections.splice(sectionIndex, 1);
            setFormData(prev => ({ ...prev, sections: newSections }));
        } else {
            alert("You must have at least one section.");
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Set updatedAt here when saving
        const now = new Date();
        const savedData = {
            ...JSON.parse(JSON.stringify(formData)),
            updatedAt: now // Store as a Firebase Timestamp object if possible, or ISO string
        };
        setDisplayedContent(savedData);
        setIsEditing(false);
        onSave(savedData);
    };

    const handleCancel = () => {
        if (displayedContent) {
            setFormData(JSON.parse(JSON.stringify(displayedContent)));
        } else {
            setFormData({
                introText: 'This Privacy Policy describes how your personal information is collected, used, and shared when you visit or make a purchase from Mvillo.',
                sections: [
                    {
                        id: uuidv4(),
                        title: '1. Information We Collect',
                        points: [{ text: '' }]
                    },
                    {
                        id: uuidv4(),
                        title: '2. How We Use Your Information',
                        points: [{ text: '' }]
                    },
                    {
                        id: uuidv4(),
                        title: '3. Sharing Your Personal Information',
                        points: [{ text: '' }]
                    },
                    {
                        id: uuidv4(),
                        title: '4. Data Security',
                        points: [{ text: '' }]
                    }
                ],
                closingRemark: 'By using our site, you consent to our Privacy Policy.',
                updatedAt: null
            });
        }
        setIsEditing(false);
    };

    const startEditing = () => {
        if (displayedContent) {
            setFormData(JSON.parse(JSON.stringify(displayedContent)));
        }
        setIsEditing(true);
    };

    const formatTimestamp = (timestamp) => {
        if (!timestamp) return 'Never';

        let date;
        // Check if it's a Firebase Timestamp object (common when reading directly from Firestore)
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

        // Format for readability, e.g., "July 1, 2025 at 6:36:30 PM UTC+8"
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

    const renderContent = (contentToRender) => {
        if (!contentToRender || !contentToRender.sections || contentToRender.sections.length === 0 ||
            (contentToRender.introText === '' && contentToRender.closingRemark === '' &&
             contentToRender.sections.every(s => s.title === '' && s.points.every(p => p.text === '')))) {
            return <p className="general-editor-form__no-content-message">No privacy policy information available. Click 'Edit Content' to add/modify.</p>;
        }

        return (
            <div className="general-editor-form__display-mode">
                <h2 className="general-editor-form__display-header">Privacy Policy</h2>
                {contentToRender.updatedAt && (
                    <div className="general-editor-form__timestamp-container">
                        <p className="general-editor-form__last-updated">
                            Last Updated: {formatTimestamp(contentToRender.updatedAt)}
                        </p>
                    </div>
                )}
                {contentToRender.introText && <p className="general-editor-form__display-intro">{contentToRender.introText}</p>}

                {contentToRender.sections.map((section, index) => (
                    <div key={section.id || index} className="general-editor-form__display-section">
                        {section.title && <h3 className="general-editor-form__display-section-title">{section.title}</h3>}
                        <ul className="general-editor-form__display-section-points">
                            {section.points?.map((point, pIndex) => (
                                point.text && (
                                    <li key={pIndex}>
                                        {point.text}
                                    </li>
                                )
                            ))}
                        </ul>
                    </div>
                ))}
                {contentToRender.closingRemark && <p className="general-editor-form__display-closing">{contentToRender.closingRemark}</p>}
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
                    {/* Introduction Text */}
                    <div className="general-editor-form__intro-text-group">
                        <label htmlFor="introText" className="general-editor-form__label">
                            Introduction Text
                        </label>
                        <textarea
                            id="introText"
                            name="introText"
                            rows="4"
                            className="general-editor-form__textarea"
                            value={formData.introText}
                            onChange={handleChange}
                            placeholder="Enter introductory text for your privacy policy."
                        />
                    </div>

                    {/* Sections */}
                    <h3 className="general-editor-form__section-heading">Privacy Policy Sections</h3>
                    <div className="general-editor-form__sections-container">
                        {formData.sections.map((section, sectionIndex) => (
                            <div key={section.id || sectionIndex} className="general-editor-form__section">
                                <div className="general-editor-form__section-header">
                                    <label htmlFor={`section-title-${sectionIndex}`} className="general-editor-form__section-title-label">
                                        Section Title
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => removeSection(sectionIndex)}
                                        className="general-editor-form__remove-section-btn"
                                    >
                                        <FaTrash className="icon-margin-right" />
                                        <span>Remove Section</span>
                                    </button>
                                </div>
                                <input
                                    type="text"
                                    id={`section-title-${sectionIndex}`}
                                    className="general-editor-form__input"
                                    value={section.title}
                                    onChange={(e) => handleSectionTitleChange(sectionIndex, e.target.value)}
                                    placeholder="e.g., Data Collection, How We Use Information"
                                />

                                <h4 className="general-editor-form__section-points-heading">Points/Clauses:</h4>
                                <div className="general-editor-form__points-list">
                                    {section.points.map((point, pointIndex) => (
                                        <div key={pointIndex} className="general-editor-form__point">
                                            <div>
                                                <label htmlFor={`point-text-${sectionIndex}-${pointIndex}`} className="general-editor-form__point-label">
                                                    Clause Content
                                                </label>
                                                <textarea
                                                    id={`point-text-${sectionIndex}-${pointIndex}`}
                                                    rows="2"
                                                    className="general-editor-form__textarea general-editor-form__point-textarea"
                                                    value={point.text}
                                                    onChange={(e) => handlePointChange(sectionIndex, pointIndex, e.target.value)}
                                                    placeholder="Enter a clause or point for this section."
                                                />
                                            </div>
                                            <div className="general-editor-form__remove-point-btn-wrapper">
                                                <button
                                                    type="button"
                                                    onClick={() => removePoint(sectionIndex, pointIndex)}
                                                    className="general-editor-form__remove-point-btn"
                                                >
                                                    <FaTrash className="icon-margin-right" /> Remove Clause
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => addPoint(sectionIndex)}
                                    className="general-editor-form__add-point-btn"
                                >
                                    <FaPlus className="icon-margin-right" />
                                    <span>Add Clause</span>
                                </button>
                            </div>
                        ))}
                    </div>

                    <button
                        type="button"
                        onClick={addSection}
                        className="general-editor-form__add-section-btn"
                    >
                        <FaPlus className="icon-margin-right" />
                        <span>Add New Section</span>
                    </button>

                    {/* Closing Remark */}
                    <div className="general-editor-form__closing-remark-group">
                        <label htmlFor="closingRemark" className="general-editor-form__label">
                            Closing Remark
                        </label>
                        <textarea
                            id="closingRemark"
                            name="closingRemark"
                            rows="3"
                            className="general-editor-form__textarea"
                            value={formData.closingRemark}
                            onChange={handleChange}
                            placeholder="Enter a closing remark for the privacy policy."
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

export default PrivacyPolicyForm;