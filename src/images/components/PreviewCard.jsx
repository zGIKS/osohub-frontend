import { useState } from 'react';
import { Heart } from 'lucide-react';
import './PreviewCard.css';

const PreviewCard = ({ 
  image, 
  variant = 'feed', // 'feed' or 'profile'
  onClick = () => {}
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(true);
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

  return (
    <div 
      className={`preview-card ${variant}`}
      onClick={onClick}
      onMouseEnter={() => variant === 'feed' && setShowInfo(true)}
      onMouseLeave={() => variant === 'feed' && setShowInfo(false)}
    >
      {/* Image Container - Dynamic height based on image */}
      <div className="preview-image-container">
        {!imageLoaded && !imageError && (
          <div className="image-loading">
            <div className="loading-pulse"></div>
          </div>
        )}
        
        {imageError ? (
          <div className="image-error">
            Failed to load image
          </div>
        ) : (
          <img
            src={image.url}
            alt={image.title || image.description || 'Image'}
            className="preview-image"
            onLoad={handleImageLoad}
            onError={handleImageError}
            style={{ display: imageLoaded && !imageError ? 'block' : 'none' }}
          />
        )}

        {/* Hover Overlay - Only for feed variant */}
        {variant === 'feed' && showInfo && imageLoaded && !imageError && (
          <div className="preview-overlay">
            <div className="preview-overlay-content">
              <div className="preview-user-info">
                <div className="preview-avatar">
                  {renderAvatar()}
                </div>
                <span className="preview-username">
                  {image.user?.username || 'Unknown User'}
                </span>
              </div>
              
              {(image.likeCount > 0) && (
                <div className="preview-likes">
                  <Heart size={16} fill="white" color="white" />
                  <span>{image.likeCount}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PreviewCard;
