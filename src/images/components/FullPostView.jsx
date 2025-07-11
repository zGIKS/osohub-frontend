import { useState, useEffect } from 'react';
import { Utensils, ChevronLeft, ChevronRight, X, MoreHorizontal, Trash2, Flag } from 'lucide-react';
import { imageService } from '../services/imageService';
import { debugLog } from '../../config';
import { useToast } from '../../auth/hooks/useToast';
import DeleteConfirmModal from './DeleteConfirmModal';
import ReportImageModal from './ReportImageModal';
import './FullPostView.css';

const FullPostView = ({ 
  image, 
  images = [], 
  onClose, 
  onNavigate,
  onDelete,
  currentUserId 
}) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [likeLoading, setLikeLoading] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isReporting, setIsReporting] = useState(false);
  const [likeAnimation, setLikeAnimation] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageDimensions, setImageDimensions] = useState(null);
  const { showToast } = useToast();

  // Find current image index
  const currentIndex = images.findIndex(img => img.id === image.id);
  const canNavigatePrev = currentIndex > 0;
  const canNavigateNext = currentIndex < images.length - 1;

  // Load like information
  useEffect(() => {
    const loadLikeInfo = async () => {
      try {
        const [likeData, likedStatus] = await Promise.all([
          imageService.getLikeCount(image.id),
          imageService.checkIfLiked(image.id)
        ]);
        // Ensure like count is never negative
        setLikeCount(Math.max(0, likeData.count || 0));
        setIsLiked(likedStatus);
      } catch (error) {
        debugLog('Failed to load like info for full post:', { imageId: image.id, error: error.message });
        // Ensure fallback like count is never negative
        setLikeCount(Math.max(0, image.likeCount || 0));
        setIsLiked(image.isLiked || false);
      }
    };

    loadLikeInfo();
  }, [image.id]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft' && canNavigatePrev) {
        handleNavigate('prev');
      } else if (e.key === 'ArrowRight' && canNavigateNext) {
        handleNavigate('next');
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [canNavigatePrev, canNavigateNext, onClose]);

  const handleLikeClick = async () => {
    if (likeLoading) return;
    
    setLikeLoading(true);
    const originalLiked = isLiked;
    const originalCount = likeCount;
    
    try {
      // Optimistic update with animation and proper validation
      if (isLiked) {
        // Prevent negative likes - only proceed if count is greater than 0
        if (likeCount > 0) {
          setIsLiked(false);
          setLikeCount(prev => Math.max(0, prev - 1));
          await imageService.removeLike(image.id);
        } else {
          // Already at 0, just update the UI state
          setIsLiked(false);
        }
      } else {
        setIsLiked(true);
        setLikeCount(prev => Math.max(0, prev + 1)); // Ensure non-negative
        // Trigger like animation
        setLikeAnimation(true);
        setTimeout(() => setLikeAnimation(false), 600);
        await imageService.likeImage(image.id);
      }
    } catch (error) {
      // Revert optimistic update on error
      setIsLiked(originalLiked);
      setLikeCount(Math.max(0, originalCount)); // Ensure non-negative on revert
      console.error('Error toggling like:', error);
      showToast('Failed to update like status', 'error');
    } finally {
      setLikeLoading(false);
    }
  };

  const handleNavigate = (direction) => {
    if (!onNavigate) return;
    
    if (direction === 'prev' && canNavigatePrev) {
      onNavigate('prev');
    } else if (direction === 'next' && canNavigateNext) {
      onNavigate('next');
    }
  };

  const handleDelete = async () => {
    // Prevent double deletion
    if (isDeleting) return;
    
    setIsDeleting(true);
    try {
      if (onDelete) {
        // Use parent's delete handler which includes state updates
        await onDelete(image.id);
      } else {
        // Fallback to direct service call
        await imageService.deleteImage(image.id);
        showToast('Image deleted successfully', 'success');
      }
      setShowDeleteModal(false);
      setShowOptions(false);
      onClose(); // Close the full view after deletion
    } catch (error) {
      console.error('Error deleting image:', error);
      showToast('Failed to delete image', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleReport = async (category, reason) => {
    setIsReporting(true);
    try {
      if (!category || !category.trim()) {
        showToast('Please select a category', 'error');
        return;
      }
      if (!reason || reason.trim().length < 10) {
        showToast('Please provide a more detailed reason (at least 10 characters)', 'error');
        return;
      }

      await imageService.reportImage(image.id, category.trim(), reason.trim());
      setShowReportModal(false);
      setShowOptions(false);
      showToast('Image reported successfully', 'success');
    } catch (error) {
      console.error('Error reporting image:', error);
      let errorMessage = 'Failed to report image. Please try again.';
      
      if (error.response?.status === 400) {
        errorMessage = 'Invalid report data. Please check your input.';
      } else if (error.response?.status === 401) {
        errorMessage = 'You must be logged in to report images.';
      } else if (error.response?.status === 429) {
        errorMessage = 'Too many reports. Please wait before trying again.';
      }
      
      showToast(errorMessage, 'error');
    } finally {
      setIsReporting(false);
    }
  };

  const generateInitials = (username) => {
    if (!username) return 'U';
    return username.charAt(0).toUpperCase();
  };

  const renderAvatar = () => {
    const profileUrl = image.user?.profile_picture_url;
    const hasValidUrl = profileUrl && 
                       profileUrl !== 'null' && 
                       profileUrl !== '' && 
                       profileUrl !== 'undefined';
    
    if (hasValidUrl) {
      return (
        <img 
          src={profileUrl} 
          alt={image.user?.username || 'User'}
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextElementSibling.style.display = 'flex';
          }}
        />
      );
    }
    
    return (
      <div className="avatar-fallback">
        {generateInitials(image.user?.username)}
      </div>
    );
  };

  const canDelete = currentUserId && image.userId === currentUserId;

  // Debug logging for delete permissions
  useEffect(() => {
    debugLog('FullPostView delete permissions:', {
      currentUserId,
      imageUserId: image.userId,
      imageUserIdFromUser: image.user?.user_id,
      canDelete,
      image: {
        id: image.id,
        userId: image.userId,
        user: image.user
      }
    });
  }, [currentUserId, image.userId, canDelete, image.id]);

  // Handle image load to get natural dimensions
  const handleImageLoad = (e) => {
    const { naturalWidth, naturalHeight } = e.target;
    setImageDimensions({ width: naturalWidth, height: naturalHeight });
    setImageLoaded(true);
  };

  // Calculate optimal image display size based on aspect ratio
  const getImageContainerStyle = () => {
    if (!imageLoaded || !imageDimensions) {
      return { minWidth: '400px', minHeight: '400px' };
    }

    const { width, height } = imageDimensions;
    const aspectRatio = width / height;
    
    // Maximum dimensions based on viewport
    const maxWidth = Math.min(window.innerWidth * 0.7, 800);
    const maxHeight = Math.min(window.innerHeight * 0.8, 800);
    
    let containerWidth, containerHeight;
    
    if (aspectRatio > 1) {
      // Landscape - prioritize width
      containerWidth = Math.min(maxWidth, width);
      containerHeight = containerWidth / aspectRatio;
      
      if (containerHeight > maxHeight) {
        containerHeight = maxHeight;
        containerWidth = containerHeight * aspectRatio;
      }
    } else {
      // Portrait or square - prioritize height
      containerHeight = Math.min(maxHeight, height);
      containerWidth = containerHeight * aspectRatio;
      
      if (containerWidth > maxWidth) {
        containerWidth = maxWidth;
        containerHeight = containerWidth / aspectRatio;
      }
    }

    return {
      width: `${Math.max(400, containerWidth)}px`,
      height: `${Math.max(400, containerHeight)}px`,
      minWidth: '400px',
      minHeight: '400px'
    };
  };

  return (
    <>
      <div className="full-post-overlay" onClick={onClose}>
        {/* Navigation Arrows - Outside container */}
        {canNavigatePrev && (
          <button 
            className="nav-arrow nav-prev"
            onClick={(e) => {
              e.stopPropagation();
              handleNavigate('prev');
            }}
          >
            <ChevronLeft size={24} />
          </button>
        )}
        
        {canNavigateNext && (
          <button 
            className="nav-arrow nav-next"
            onClick={(e) => {
              e.stopPropagation();
              handleNavigate('next');
            }}
          >
            <ChevronRight size={24} />
          </button>
        )}

        <div className="full-post-container" onClick={(e) => e.stopPropagation()}>
          {/* Close Button */}
          <button className="full-post-close" onClick={onClose}>
            <X size={18} />
          </button>

          {/* Main Content */}
          <div className="full-post-content">
            {/* Image */}
            <div 
              className="full-post-image-container"
              style={getImageContainerStyle()}
            >
              <img 
                src={image.url}
                alt={image.title || image.description || 'Image'}
                className="full-post-image"
                onLoad={handleImageLoad}
              />
            </div>

            {/* Info Panel */}
            <div className="full-post-info">
              {/* User Header */}
              <div className="full-post-header">
                <div className="full-post-user">
                  <div className="full-post-avatar">
                    {renderAvatar()}
                  </div>
                  <div className="full-post-user-details">
                    <span className="full-post-username">
                      {image.user?.username || 'Unknown User'}
                    </span>
                    <span className="full-post-date">
                      {new Date(image.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Options Menu */}
                <div className="full-post-options">
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

              {/* Description */}
              {(image.title || image.description) && (
                <div className="full-post-description">
                  <p>{image.title || image.description}</p>
                </div>
              )}

              {/* Actions */}
              <div className="full-post-actions">
                <button 
                  className={`full-post-like-btn ${isLiked ? 'liked' : ''} ${likeAnimation ? 'animating' : ''}`}
                  onClick={handleLikeClick}
                  disabled={likeLoading}
                >
                  <Utensils 
                    size={24} 
                    fill={isLiked ? 'currentColor' : 'none'}
                    color="currentColor"
                    className="utensils-icon"
                  />
                  <span className="like-count">
                    {likeCount} {likeCount === 1 ? 'like' : 'likes'}
                  </span>
                </button>
              </div>
            </div>
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

export default FullPostView;
