import { useState, useEffect } from 'react';
import { Heart, MoreHorizontal, Trash2, Flag } from 'lucide-react';
import { useToast } from '../../../auth/hooks/useToast';
import './ImageCard.css';

/**
 * Generic ImageCard component that can be used across different contexts
 * @param {Object} props
 * @param {Object} props.image - Image data object
 * @param {Function} props.onLike - Callback for like action
 * @param {Function} props.onDelete - Callback for delete action
 * @param {Function} props.onReport - Callback for report action
 * @param {string} props.currentUserId - Current user ID
 * @param {boolean} props.showActions - Whether to show action buttons
 * @param {boolean} props.showUserInfo - Whether to show user info
 * @param {string} props.variant - Card variant: 'feed', 'profile', 'public'
 */
const ImageCard = ({ 
  image, 
  onLike, 
  onDelete, 
  onReport,
  currentUserId, 
  showActions = true,
  showUserInfo = true,
  variant = 'feed'
}) => {
  const [isLiked, setIsLiked] = useState(image.isLiked || false);
  const [likeCount, setLikeCount] = useState(image.likeCount || 0);
  const [showOptions, setShowOptions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();

  const handleLike = async () => {
    if (isLoading || !onLike) return;
    
    setIsLoading(true);
    try {
      const result = await onLike(image.id, isLiked);
      if (result) {
        setIsLiked(!isLiked);
        setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      showToast('Error al dar like', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    
    try {
      await onDelete(image.id);
      showToast('Imagen eliminada correctamente', 'success');
    } catch (error) {
      console.error('Error deleting image:', error);
      showToast('Error al eliminar la imagen', 'error');
    }
  };

  const handleReport = async (reason) => {
    if (!onReport) return;
    
    try {
      await onReport(image.id, reason);
      showToast('Reporte enviado correctamente', 'success');
    } catch (error) {
      console.error('Error reporting image:', error);
      showToast('Error al reportar la imagen', 'error');
    }
  };

  const isOwner = currentUserId && image.userId === currentUserId;

  return (
    <div className={`image-card image-card--${variant}`}>
      <div className="image-container">
        <img 
          src={image.url} 
          alt={image.description || 'Imagen'} 
          className="image"
          loading="lazy"
        />
        
        {showActions && (
          <div className="image-overlay">
            <button
              onClick={handleLike}
              disabled={isLoading}
              className={`like-btn ${isLiked ? 'liked' : ''}`}
              aria-label={isLiked ? 'Quitar like' : 'Dar like'}
            >
              <Heart size={20} />
            </button>

            <div className="options-container">
              <button
                onClick={() => setShowOptions(!showOptions)}
                className="options-btn"
                aria-label="Opciones"
              >
                <MoreHorizontal size={20} />
              </button>

              {showOptions && (
                <div className="options-menu">
                  {isOwner && onDelete && (
                    <button
                      onClick={handleDelete}
                      className="option-item delete"
                    >
                      <Trash2 size={16} />
                      Eliminar
                    </button>
                  )}
                  {!isOwner && onReport && (
                    <button
                      onClick={() => handleReport('inappropriate')}
                      className="option-item"
                    >
                      <Flag size={16} />
                      Reportar
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {showUserInfo && (
        <div className="image-info">
          <div className="user-info">
            <div className="user-avatar">
              {image.user?.profile_picture_url ? (
                <img 
                  src={image.user.profile_picture_url} 
                  alt={image.user.username || 'Usuario'}
                />
              ) : (
                <span>
                  {(image.user?.username?.[0] || 'U').toUpperCase()}
                </span>
              )}
            </div>
            <span className="username">
              {image.user?.username || 'Usuario desconocido'}
            </span>
          </div>
          <div className="like-count">
            <Heart size={16} />
            <span>{likeCount}</span>
          </div>
        </div>
      )}

      {image.description && (
        <div className="image-description">
          {image.description}
        </div>
      )}
    </div>
  );
};

export default ImageCard;
