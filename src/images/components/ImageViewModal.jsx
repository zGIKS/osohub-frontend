import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, Heart, MoreHorizontal, Trash2, Flag, ChevronLeft, ChevronRight } from 'lucide-react';
import { imageService } from '../services/imageService';
import { debugLog } from '../../config';
import DeleteConfirmModal from './DeleteConfirmModal';
import ReportImageModal from './ReportImageModal';
import './ImageViewModal.css';

const ImageViewModal = ({ 
  isOpen, 
  onClose, 
  image, 
  images = [],
  currentIndex = 0,
  currentUserId, 
  onDelete,
  onImageChange
}) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [showOptions, setShowOptions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isReporting, setIsReporting] = useState(false);
  const [likeCountLoaded, setLikeCountLoaded] = useState(false);

  // Load like info when modal opens
  useEffect(() => {
    if (isOpen && image && !likeCountLoaded) {
      loadLikeInfo();
    }
  }, [isOpen, image, likeCountLoaded]);

  // Close modal on Escape key and navigate with arrow keys
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goToPrevious();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        goToNext();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, currentIndex, images.length]);

  const loadLikeInfo = async () => {
    try {
      debugLog('Loading like info for image:', image.id);
      const likeData = await imageService.getLikeCount(image.id);
      setLikeCount(likeData.count || 0);
      setIsLiked(false);
      setLikeCountLoaded(true);
      debugLog('Like info loaded:', { 
        imageId: image.id, 
        count: likeData.count, 
        isLiked: false 
      });
    } catch (error) {
      debugLog('Failed to load like info:', { imageId: image.id, error: error.message });
      setLikeCountLoaded(true);
    }
  };

  const handleLike = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    const originalLiked = isLiked;
    const originalCount = likeCount;
    
    try {
      if (isLiked) {
        setIsLiked(false);
        setLikeCount(prev => Math.max(0, prev - 1));
        debugLog('Removing like...', { imageId: image.id });
        await imageService.removeLike(image.id);
        debugLog('Like removed successfully');
      } else {
        setIsLiked(true);
        setLikeCount(prev => prev + 1);
        debugLog('Adding like...', { imageId: image.id });
        await imageService.likeImage(image.id);
        debugLog('Like added successfully');
      }
      
      // Reload like count from server
      try {
        const likeData = await imageService.getLikeCount(image.id);
        setLikeCount(likeData.count || 0);
      } catch (reloadError) {
        debugLog('Failed to reload like count, keeping optimistic update');
      }
    } catch (error) {
      setIsLiked(originalLiked);
      setLikeCount(originalCount);
      debugLog('Like action failed:', { imageId: image.id, error: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      debugLog('Deleting image...', { imageId: image.id });
      await imageService.deleteImage(image.id);
      debugLog('Image deleted successfully');
      onDelete(image.id);
      onClose();
    } catch (error) {
      debugLog('Delete error:', error);
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleReport = async (reason) => {
    try {
      setIsReporting(true);
      debugLog('Reporting image...', { imageId: image.id, reason });
      await imageService.reportImage(image.id, reason);
      debugLog('Image reported successfully');
      setShowReportModal(false);
    } catch (error) {
      debugLog('Report error:', error);
      throw error;
    } finally {
      setIsReporting(false);
    }
  };

  // Navigation functions
  const goToPrevious = () => {
    if (images.length <= 1) return;
    const newIndex = currentIndex > 0 ? currentIndex - 1 : images.length - 1;
    const newImage = images[newIndex];
    if (newImage && onImageChange) {
      setLikeCountLoaded(false); // Reset like data for new image
      onImageChange(newImage, newIndex);
    }
  };

  const goToNext = () => {
    if (images.length <= 1) return;
    const newIndex = currentIndex < images.length - 1 ? currentIndex + 1 : 0;
    const newImage = images[newIndex];
    if (newImage && onImageChange) {
      setLikeCountLoaded(false); // Reset like data for new image
      onImageChange(newImage, newIndex);
    }
  };

  const canDelete = currentUserId && image.userId === currentUserId;
  const canNavigate = images.length > 1;

  if (!isOpen || !image) return null;

  return (
    <>
      <div className="image-view-modal">
        <div className="modal-backdrop" onClick={onClose} />
        
        <div className="modal-content">
          {/* Close button */}
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>

          {/* Image container */}
          <div className="image-section">
            {/* Navigation arrows */}
            {canNavigate && (
              <>
                <button 
                  className="nav-arrow nav-arrow-left" 
                  onClick={goToPrevious}
                  title="Previous image"
                >
                  <ChevronLeft size={24} />
                </button>
                <button 
                  className="nav-arrow nav-arrow-right" 
                  onClick={goToNext}
                  title="Next image"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}
            
            <img 
              src={image.url || 'https://via.placeholder.com/800x600?text=No+Image'} 
              alt={image.description || 'Image'} 
              className="main-image"
            />
          </div>

          {/* Info panel */}
          <div className="info-panel">
            {/* User info */}
            <div className="user-section">
              <Link 
                to={currentUserId && image.userId === currentUserId ? '/profile' : '#'} 
                className="user-link"
                onClick={(e) => {
                  if (currentUserId && image.userId === currentUserId) {
                    onClose();
                  } else {
                    e.preventDefault(); // For now, don't navigate for other users
                  }
                }}
              >
                <div className="user-avatar">
                  {image.user?.profile_picture_url && 
                   image.user.profile_picture_url !== 'null' && 
                   image.user.profile_picture_url !== '' && 
                   image.user.profile_picture_url !== 'undefined' ? (
                    <img 
                      src={image.user.profile_picture_url} 
                      alt={image.user.username || 'User'}
                    />
                  ) : (
                    <span>
                      {(image.user?.username || 'U')[0]?.toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="user-details">
                  <span className="username">{image.user?.username || 'User'}</span>
                </div>
              </Link>

              {/* Actions */}
              <div className="image-actions">
                <button
                  className={`like-btn ${isLiked ? 'liked' : ''}`}
                  onClick={handleLike}
                  disabled={isLoading}
                >
                  <Heart 
                    size={20} 
                    fill={isLiked ? '#ff1744' : 'none'} 
                    color={isLiked ? '#ff1744' : 'currentColor'}
                  />
                </button>
                
                <div className="options-container">
                  <button
                    className="options-btn"
                    onClick={() => setShowOptions(!showOptions)}
                  >
                    <MoreHorizontal size={20} />
                  </button>
                  
                  {showOptions && (
                    <div className="options-menu">
                      {canDelete && (
                        <button 
                          onClick={() => {
                            setShowDeleteModal(true);
                            setShowOptions(false);
                          }} 
                          className="option-item delete"
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      )}
                      <button 
                        onClick={() => {
                          setShowReportModal(true);
                          setShowOptions(false);
                        }} 
                        className="option-item"
                      >
                        <Flag size={16} />
                        Report
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Like count */}
            {likeCount > 0 && (
              <div className="like-count">
                <Heart size={14} fill="currentColor" />
                <span>{likeCount} {likeCount === 1 ? 'like' : 'likes'}</span>
              </div>
            )}

            {/* Description */}
            {image.description && (
              <div className="description-section">
                <p>{image.description}</p>
              </div>
            )}

            {/* Upload date */}
            {image.createdAt && (
              <div className="date-section">
                <span>{new Date(image.createdAt).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />

      <ReportImageModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        onReport={handleReport}
        isLoading={isReporting}
      />
    </>
  );
};

export default ImageViewModal;
