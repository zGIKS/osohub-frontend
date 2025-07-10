import { useState, useEffect, useRef } from 'react';
import { Heart } from 'lucide-react';
import { imageService } from '../services/imageService';
import { debugLog } from '../../config';
import './ImageCard.css';

const ImageCard = ({ image, onDelete, currentUserId, onClick }) => {
  const [likeCount, setLikeCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCountLoaded, setLikeCountLoaded] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [likeLoading, setLikeLoading] = useState(false);
  const imageRef = useRef(null);

  // Load like count and status from API
  useEffect(() => {
    const loadLikeInfo = async () => {
      if (!likeCountLoaded) {
        try {
          debugLog('Loading like info for image:', image.id);
          
          // Load both like count and status from the API
          const [likeData, likedStatus] = await Promise.all([
            imageService.getLikeCount(image.id),
            currentUserId ? imageService.checkIfLiked(image.id) : Promise.resolve(false)
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
          setLikeCount(image.likeCount || 0);
          setIsLiked(image.isLiked || false);
          setLikeCountLoaded(true);
        }
      }
    };

    loadLikeInfo();
  }, [image.id, likeCountLoaded, currentUserId]);

  // Handle image load to get natural dimensions
  const handleImageLoad = () => {
    if (imageRef.current) {
      const { naturalWidth, naturalHeight } = imageRef.current;
      setImageDimensions({ width: naturalWidth, height: naturalHeight });
      setImageLoaded(true);
      debugLog('Image loaded with dimensions:', { 
        imageId: image.id, 
        width: naturalWidth, 
        height: naturalHeight 
      });
    }
  };

  // Calculate aspect ratio for dynamic height
  const getImageStyle = () => {
    if (!imageLoaded || !imageDimensions.width || !imageDimensions.height) {
      return { aspectRatio: '1 / 1' }; // Default square ratio while loading
    }
    
    const aspectRatio = imageDimensions.width / imageDimensions.height;
    return { aspectRatio: `${aspectRatio} / 1` };
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

  const handleCardClick = () => {
    if (onClick) {
      onClick(image);
    }
  };

  const handleLikeClick = async (e) => {
    e.stopPropagation(); // Prevent triggering card click
    
    if (likeLoading || !currentUserId) return;
    
    setLikeLoading(true);
    const originalLiked = isLiked;
    const originalCount = likeCount;
    
    try {
      // Optimistic update
      if (isLiked) {
        setIsLiked(false);
        setLikeCount(prev => Math.max(0, prev - 1));
        await imageService.removeLike(image.id);
        debugLog('Like removed successfully');
      } else {
        setIsLiked(true);
        setLikeCount(prev => prev + 1);
        await imageService.likeImage(image.id);
        debugLog('Like added successfully');
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
      setLikeLoading(false);
    }
  };
  return (
    <div className="image-card" onClick={handleCardClick}>
      <div className="image-container" style={getImageStyle()}>
        <img 
          ref={imageRef}
          src={image.url} 
          alt={image.description || image.title || 'Image'} 
          className="image"
          loading="lazy"
          onLoad={handleImageLoad}
        />
        
        {/* Hover overlay with user info and like count */}
        <div className="image-hover-overlay">
          <div className="hover-user-info">
            <div className="hover-avatar">
              {renderAvatar()}
            </div>
            <span className="hover-username">{image.user?.username || 'Unknown User'}</span>
          </div>
          
          {/* Always show likes on hover */}
          <button 
            className={`hover-likes ${isLiked ? 'liked' : ''} ${!currentUserId ? 'no-interaction' : ''}`}
            onClick={handleLikeClick}
            disabled={likeLoading || !currentUserId}
          >
            <Heart 
              size={16} 
              className="hover-heart-icon" 
              fill={isLiked ? '#dc267f' : 'none'}
              color={isLiked ? '#dc267f' : 'white'}
            />
            <span>{likeCount} {likeCount === 1 ? 'like' : 'likes'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageCard;
