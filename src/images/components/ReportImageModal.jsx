import { useState } from 'react';
import { X, Flag, AlertTriangle } from 'lucide-react';
import './ReportImageModal.css';

const ReportImageModal = ({ isOpen, onClose, onReport, isLoading = false }) => {
  const [reason, setReason] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reason.trim()) return;
    
    onReport(reason.trim());
  };

  const handleClose = () => {
    setReason('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="report-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Report Image</h2>
          <button className="close-btn" onClick={handleClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="report-form">
          <div className="report-section">
            <div className="report-icon">
              <AlertTriangle size={48} />
            </div>
            <h3>Report this image</h3>
            <p>Help us understand what's wrong with this content.</p>
          </div>

          <div className="reason-section">
            <label htmlFor="report-reason" className="section-label">
              Reason for reporting <span className="required">*</span>
            </label>
            <textarea
              id="report-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please explain why you're reporting this image (inappropriate content, spam, violence, copyright, harassment, etc.)"
              rows="4"
              required
              maxLength={500}
            />
            <p className="char-count">{reason.length}/500</p>
          </div>

          <div className="modal-actions">
            <button 
              type="button" 
              className="cancel-btn" 
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="report-btn"
              disabled={!reason.trim() || isLoading}
            >
              {isLoading ? (
                <>
                  <Flag size={16} className="spinning" />
                  Reporting...
                </>
              ) : (
                <>
                  <Flag size={16} />
                  Submit Report
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportImageModal;
