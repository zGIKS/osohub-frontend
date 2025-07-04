import { useState, useEffect } from 'react';
import { Heart, MoreHorizontal, Trash2, Flag } from 'lucide-react';
import { imageService } from '../services/imageService';
import { debugLog } from '../../config';
import { useToast } from '../../auth/hooks/useToast';
import DeleteConfirmModal from './DeleteConfirmModal';
import ReportImageModal from './ReportImageModal';
import './ImageCard.css';

const ImageCard = ({ image, onDelete, currentUserId }) => {
  const [isLiked, setIsLiked] = useState(false); // Always start with false, load from API
  const [likeCount, setLikeCount] = useState(0); // Always start with 0, load from API
  const [showOptions, setShowOptions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isReporting, setIsReporting] = useState(false);
  const [likeCountLoaded, setLikeCountLoaded] = useState(false); // Always load from API
  const { showToast } = useToast();

  // Debug: Log image data to see user profile picture
  useEffect(() => {
    debugLog('ImageCard received data:', {
      imageId: image.id,
      username: image.user?.username,
      profilePictureUrl: image.user?.profile_picture_url,
      initialLikeCount: image.likeCount,
      initialIsLiked: image.isLiked
    });
  }, [image]);

  // Load like count and status if not provided by backend
  useEffect(() => {
    const loadLikeInfo = async () => {
      if (!likeCountLoaded) {
        try {
          debugLog('Loading like info for image:', image.id);
          
          // Load both like count and status from the API
          const [likeData, likedStatus] = await Promise.all([
            imageService.getLikeCount(image.id),
            imageService.checkIfLiked(image.id)
          ]);
          
          setLikeCount(likeData.count || 0);
          setIsLiked(likedStatus);
          setLikeCountLoaded(true);
          
          debugLog('Like info loaded:', { 
            imageId: image.id, 
            count: likeData.count, 
            isLiked: likedStatus 
          });
        } catch (error) {
          debugLog('Failed to load like info:', { imageId: image.id, error: error.message });
          // Keep the default values
          setLikeCount(0);
          setIsLiked(false);
          setLikeCountLoaded(true);
        }
      }
    };

    loadLikeInfo();
  }, [image.id, likeCountLoaded]);

  const handleLike = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    const originalLiked = isLiked;
    const originalCount = likeCount;
    
    try {
      // Optimistic update
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
      
      // Reload both like count and status from server to ensure consistency
      try {
        const [likeData, likedStatus] = await Promise.all([
          imageService.getLikeCount(image.id),
          imageService.checkIfLiked(image.id)
        ]);
        
        setLikeCount(likeData.count || 0);
        setIsLiked(likedStatus);
        
        debugLog('Reloaded like info after action:', { 
          imageId: image.id, 
          count: likeData.count, 
          isLiked: likedStatus 
        });
      } catch (reloadError) {
        debugLog('Failed to reload like info, keeping optimistic update', { 
          imageId: image.id, 
          error: reloadError.message 
        });
      }
    } catch (error) {
      // Revert optimistic update on error
      setIsLiked(originalLiked);
      setLikeCount(originalCount);
      console.error('Error toggling like:', error);
      debugLog('Like toggle failed, reverted state', { 
        error: error.message,
        imageId: image.id 
      });
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

  const handleReport = async (category, reason) => {
    setIsReporting(true);
    try {
      // Validate inputs
      if (!category || !category.trim()) {
        showToast('Please select a category', 'error');
        return;
      }
      if (!reason || !reason.trim()) {
        showToast('Please provide a reason for reporting', 'error');
        return;
      }
      if (reason.trim().length < 10) {
        showToast('Please provide a more detailed reason (at least 10 characters)', 'error');
        return;
      }

      debugLog('Attempting to report image...', { imageId: image.id, category, reason: reason.trim() });
      await imageService.reportImage(image.id, category.trim(), reason.trim());
      setShowReportModal(false);
      setShowOptions(false);
      showToast('Image reported successfully', 'success');
      debugLog('Image reported successfully');
    } catch (error) {
      console.error('Error reporting image:', error);
      debugLog('Report error:', error);
      
      // Show user-friendly error message
      let errorMessage = 'Failed to report image. Please try again.';
      if (error.response?.status === 400) {
        errorMessage = 'Invalid report data. Please check your input.';
      } else if (error.response?.status === 401) {
        errorMessage = 'You must be logged in to report images.';
      } else if (error.response?.status === 429) {
        errorMessage = 'Too many reports. Please wait before trying again.';
      } else if (error.response?.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      }
      
      showToast(errorMessage, 'error');
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
              <Heart 
                size={20} 
                fill={isLiked ? '#dc267f' : 'none'} 
                color={isLiked ? '#dc267f' : 'white'}
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
        
        {/* Image info */}
        <div className="image-info">
          <div className="user-info">
            <div className="user-avatar">
              {(() => {
                const profileUrl = image.user?.profile_picture_url;
                const hasValidUrl = profileUrl && 
                                   profileUrl !== 'null' && 
                                   profileUrl !== '' && 
                                   profileUrl !== 'undefined';
                
                debugLog('Avatar render decision:', {
                  profileUrl,
                  hasValidUrl,
                  username: image.user?.username
                });

                if (hasValidUrl) {
                  return (
                    <img 
                      src={profileUrl} 
                      alt={image.user.username || 'Usuario'}
                      onLoad={() => debugLog('✅ Profile image loaded:', profileUrl)}
                      onError={(e) => {
                        debugLog('❌ Profile image failed:', profileUrl);
                        e.target.style.display = 'none';
                        e.target.nextElementSibling.style.display = 'flex';
                      }}
                    />
                  );
                } else {
                  return null;
                }
              })()}
              <span 
                style={{ 
                  display: image.user?.profile_picture_url && 
                          image.user.profile_picture_url !== 'null' && 
                          image.user.profile_picture_url !== '' && 
                          image.user.profile_picture_url !== 'undefined' ? 'none' : 'flex' 
                }}
              >
                {(image.user?.username || 'U')[0]?.toUpperCase()}
              </span>
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
