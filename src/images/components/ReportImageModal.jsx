import { useState, useEffect } from 'react';
import { X, Flag, AlertTriangle } from 'lucide-react';
import { imageService } from '../services/imageService';
import { debugLog } from '../../config';
import './ReportImageModal.css';

const ReportImageModal = ({ isOpen, onClose, onReport, isLoading = false }) => {
  const [category, setCategory] = useState('');
  const [reason, setReason] = useState('');
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadCategories();
    }
  }, [isOpen]);

  const loadCategories = async () => {
    try {
      setLoadingCategories(true);
      debugLog('Loading report categories...');
      const categoriesData = await imageService.getReportCategories();
      setCategories(categoriesData);
      debugLog('Categories loaded:', categoriesData);
    } catch (error) {
      console.error('Failed to load report categories:', error);
      debugLog('Failed to load categories, using fallback');
    } finally {
      setLoadingCategories(false);
    }
  };

  const getWordCount = (text) => {
    return text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!category || !reason.trim()) return;
    
    onReport(category, reason.trim());
  };

  const handleClose = () => {
    setCategory('');
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

          <div className="category-section">
            <label htmlFor="report-category" className="section-label">
              Category <span className="required">*</span>
            </label>
            {loadingCategories ? (
              <div className="loading-categories">Loading categories...</div>
            ) : (
              <select
                id="report-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                className="category-select"
              >
                <option value="">Select a category...</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            )}
            {category && categories.find(cat => cat.id === category) && (
              <p className="category-description">
                {categories.find(cat => cat.id === category)?.description}
              </p>
            )}
          </div>

          <div className="reason-section">
            <label htmlFor="report-reason" className="section-label">
              Additional details <span className="required">*</span>
            </label>
            <textarea
              id="report-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please provide additional details about why you're reporting this image..."
              rows="4"
              required
              maxLength={500}
            />
            <div className="validation-info">
              <p className="char-count">{reason.length}/500 characters</p>
              <p className="word-count">{getWordCount(reason)}/50 words</p>
            </div>
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
              disabled={!category || !reason.trim() || isLoading}
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
