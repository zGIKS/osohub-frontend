import { useState } from 'react';
import { Heart, MoreHorizontal, Trash2, Flag } from 'lucide-react';
import { imageService } from '../services/imageService';
import './ImageCard.css';

const ImageCard = ({ image, onDelete, currentUserId }) => {
  const [isLiked, setIsLiked] = useState(image.isLiked || false);
  const [likeCount, setLikeCount] = useState(image.likeCount || 0);
  const [showOptions, setShowOptions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
    if (!window.confirm('Are you sure you want to delete this image?')) {
      return;
    }

    try {
      await imageService.deleteImage(image.id);
      onDelete(image.id);
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  };

  const handleReport = async () => {
    const reason = prompt('Why do you want to report this image?');
    if (!reason) return;

    try {
      await imageService.reportImage(image.id, reason);
      alert('Image reported successfully');
      setShowOptions(false);
    } catch (error) {
      console.error('Error reporting image:', error);
    }
  };

  const canDelete = currentUserId && image.userId === currentUserId;

  return (
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
                  <button onClick={handleDelete} className="option-item delete">
                    <Trash2 size={16} />
                    Delete
                  </button>
                )}
                <button onClick={handleReport} className="option-item">
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
  );
};

export default ImageCard;
