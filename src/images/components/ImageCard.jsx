import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import './ImageCard.css';

const ImageCard = ({ image, onImageClick, currentUserId }) => {
  const isOwnPost = currentUserId && image.userId === currentUserId;
  
  return (
    <div className="image-card">
      <div className="image-container" onClick={() => onImageClick && onImageClick(image)}>
        <img 
          src={image.url || 'https://via.placeholder.com/300x300?text=No+Image'} 
          alt={image.description || 'Image'} 
          className="image"
          loading="lazy"
        />
      </div>
      
      {/* Image info - VSCO style: only username and likes */}
      <div className="image-info">
        <div className="user-info">
          {isOwnPost ? (
            <Link 
              to="/profile"
              className="username-link"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="username">{image.user?.username || 'User'}</span>
            </Link>
          ) : (
            <span className="username">{image.user?.username || 'User'}</span>
          )}
        </div>
        
        {image.likeCount > 0 && (
          <div className="like-count">
            <Heart size={12} fill="currentColor" />
            <span>{image.likeCount}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageCard;
