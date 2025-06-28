import { useState } from 'react';
import { Heart, MoreHorizontal, Trash2, Flag } from 'lucide-react';
import { imageService } from '../services/imageService';
import DeleteConfirmModal from './DeleteConfirmModal';
import ReportImageModal from './ReportImageModal';
import './ImageCard.css';

const ImageCard = ({ image, onDelete, currentUserId }) => {
  const [isLiked, setIsLiked] = useState(image.isLiked || false);
  const [likeCount, setLikeCount] = useState(image.likeCount || 0);
  const [showOptions, setShowOptions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isReporting, setIsReporting] = useState(false);

  const handleLike = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      if (isLiked) {
        await imageService.removeLike(image.id);
        setIsLiked(false);
        setLikeCount(prev => prev - 1);
      } else {
        await imageService.likeImage(image.id);
        setIsLiked(true);
        setLikeCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await imageService.deleteImage(image.id);
      onDelete(image.id);
      setShowDeleteModal(false);
      setShowOptions(false);
    } catch (error) {
      console.error('Error deleting image:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleReport = async (reason) => {
    setIsReporting(true);
    try {
      await imageService.reportImage(image.id, reason);
      setShowReportModal(false);
      setShowOptions(false);
      // You could add a toast notification here
    } catch (error) {
      console.error('Error reporting image:', error);
    } finally {
      setIsReporting(false);
    }
  };

  const canDelete = currentUserId && image.userId === currentUserId;

  return (
    <>
      <div className="image-card">
        <div className="image-container">
          <img 
            src={image.url} 
            alt={image.description || 'Image'} 
            className="image"
            loading="lazy"
          />
          
          {/* Overlay with actions */}
          <div className="image-overlay">
            <button
              className={`like-btn ${isLiked ? 'liked' : ''}`}
              onClick={handleLike}
              disabled={isLoading}
            >
              <Heart size={20} fill={isLiked ? 'white' : 'none'} />
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
        
        {/* Image info */}
        <div className="image-info">
          <div className="user-info">
            <div className="user-avatar">
              {image.user?.username?.[0]?.toUpperCase() || 'U'}
            </div>
            <span className="username">{image.user?.username || 'User'}</span>
          </div>
          
          {likeCount > 0 && (
            <div className="like-count">
              <Heart size={14} />
              <span>{likeCount}</span>
            </div>
          )}
        </div>
        
        {image.description && (
          <div className="image-description">
            {image.description}
          </div>
        )}
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

export default ImageCard;
