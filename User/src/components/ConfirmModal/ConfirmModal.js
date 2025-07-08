// src/components/ConfirmModal/ConfirmModal.js
import React from 'react';
import './ConfirmModal.css'; // We'll create this CSS file next

const ConfirmModal = ({ show, title, message, onConfirm, onCancel }) => {
  if (!show) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3 className="modal-title">{title}</h3>
        <p className="modal-message">{message}</p>
        <div className="modal-actions">
          <button onClick={onCancel} className="modal-button cancel">Cancel</button>
          <button onClick={onConfirm} className="modal-button confirm">Confirm</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;