import { useState } from 'react';
import { X, Trash2, AlertTriangle } from 'lucide-react';
import './DeleteConfirmModal.css';

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, isLoading = false }) => {
  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Delete Image</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="delete-form">
          <div className="warning-section">
            <div className="warning-icon">
              <AlertTriangle size={48} />
            </div>
            <h3>Are you sure you want to delete this image?</h3>
            <p>This action cannot be undone. The image will be permanently removed from your profile and the feed.</p>
          </div>

          <div className="modal-actions">
            <button 
              type="button" 
              className="cancel-btn" 
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="delete-btn"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Trash2 size={16} className="spinning" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 size={16} />
                  Delete Image
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
