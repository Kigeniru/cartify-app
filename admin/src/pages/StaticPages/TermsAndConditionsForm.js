import React, { useState, useEffect } from 'react';
import { FaPlus, FaTrash, FaEdit } from 'react-icons/fa';
import { v4 as uuidv4 } from 'uuid';
import './GeneralEditorStyle.css';

const TermsAndConditionsForm = ({ content, onSave }) => {
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
                    points: section.points?.map(point => ({
                        text: point.bold ? `${point.bold} ${point.text}`.trim() : point.text || ''
                    })) ?? []
                })) ?? [],
                closingRemark: content.closingRemark ?? '',
                updatedAt: content.updatedAt || null
            };
            setFormData(transformedContent);
            setDisplayedContent(transformedContent);
            setIsEditing(false);
        } else {
            const defaultContent = {
                introText: 'Welcome to our Terms and Conditions. Please read them carefully.',
                sections: [
                    {
                        id: uuidv4(),
                        title: 'Introduction',
                        points: [{ text: 'This document outlines the rules and regulations for the use of our website/service.' }]
                    },
                    {
                        id: uuidv4(),
                        title: 'Definitions',
                        points: [{ text: 'User: refers to the individual accessing or using the service.' }]
                    },
                    {
                        id: uuidv4(),
                        title: 'User Responsibilities',
                        points: [{ text: 'Users agree not to misuse the service.' }]
                    },
                    {
                        id: uuidv4(),
                        title: 'Limitation of Liability',
                        points: [{ text: 'We are not responsible for indirect damages.' }]
                    }
                ],
                closingRemark: 'By using our service, you agree to these terms.',
                updatedAt: null
            };
            setFormData(defaultContent);
            setDisplayedContent(null);
            setIsEditing(true);
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
        const now = new Date();
        const savedData = {
            ...JSON.parse(JSON.stringify(formData)),
            updatedAt: now
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
                introText: 'Welcome to our Terms and Conditions. Please read them carefully.',
                sections: [
                    {
                        id: uuidv4(),
                        title: 'Introduction',
                        points: [{ text: '' }]
                    },
                    {
                        id: uuidv4(),
                        title: 'Definitions',
                        points: [{ text: '' }]
                    },
                    {
                        id: uuidv4(),
                        title: 'User Responsibilities',
                        points: [{ text: '' }]
                    },
                    {
                        id: uuidv4(),
                        title: 'Limitation of Liability',
                        points: [{ text: '' }]
                    }
                ],
                closingRemark: 'By using our service, you agree to these terms.',
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

        // We specifically want to match your format for display
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
        if (!contentToRender || !contentToRender.sections || contentToRender.sections.length === 0 ||
            (contentToRender.introText === '' && contentToRender.closingRemark === '' &&
             contentToRender.sections.every(s => s.title === '' && s.points.every(p => p.text === '')))) {
            return <p className="general-editor-form__no-content-message">No terms and conditions information available. Click 'Edit Content' to add/modify.</p>;
        }

        return (
            <div className="general-editor-form__display-mode">
                <h2 className="general-editor-form__display-header">Terms and Conditions</h2>
                {/* Wrap the timestamp in a new container div */}
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
                            placeholder="Enter introductory text for your terms and conditions."
                        />
                    </div>

                    {/* Sections */}
                    <h3 className="general-editor-form__section-heading">Terms Sections</h3>
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
                                    placeholder="e.g., Introduction, Definitions, User Responsibilities"
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
                            placeholder="Enter a closing remark for the terms and conditions."
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

export default TermsAndConditionsForm;