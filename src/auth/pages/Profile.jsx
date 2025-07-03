import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Settings, Grid3x3, Share } from 'lucide-react';
import ImageCard from '../../images/components/ImageCard';
import { imageService } from '../../images/services/imageService';
import { userService } from '../services/userService';
import { getCurrentUserId, debugLog } from '../../config';
import { useToast } from '../hooks/useToast';
import './Profile.css';

const Profile = () => {
  const [userImages, setUserImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [shareLink, setShareLink] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [isGettingShareLink, setIsGettingShareLink] = useState(false);
  
  // Toast hook for notifications
  const { success, error: showError } = useToast();

  // Get current user ID from config helper
  const currentUserId = getCurrentUserId();

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!currentUserId) {
        throw new Error('User not authenticated');
      }

      debugLog('Loading user profile...', { currentUserId });
      
      // Load user data and images in parallel
      const [userData, userImagesData] = await Promise.all([
        userService.getCurrentUser(),
        imageService.getUserImages(currentUserId)
      ]);

      debugLog('Profile data loaded:', { 
        user: userData, 
        imageCount: userImagesData?.length || 0,
        sampleImage: userImagesData?.[0]
      });

      setUser(userData);
      
      // Transform images to match expected format
      const transformedImages = transformUserImages(userImagesData || [], userData);
      setUserImages(transformedImages);
      
    } catch (error) {
      console.error('Error loading profile:', error);
      debugLog('Profile loading error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const transformUserImages = (images, userData) => {
    debugLog('Transforming user images:', { 
      imageCount: images.length,
      userData: userData,
      sampleImage: images[0]
    });

    return images.map(image => ({
      id: image.image_id,
      url: image.image_url === 'null' || !image.image_url ? 
           'https://via.placeholder.com/400x400?text=No+Image' : 
           image.image_url,
      description: image.title || 'Sin título',
      title: image.title || 'Sin título',
      userId: image.user_id,
      user: { 
        username: image.username || userData?.username || userData?.name || 'Usuario desconocido',
        user_id: image.user_id,
        profile_picture_url: image.user_profile_picture_url || userData?.profile_picture_url || null
      },
      likeCount: image.like_count || 0, // Use backend data if available
      isLiked: image.is_liked || false, // Use backend data if available
      createdAt: image.uploaded_at,
      image_id: image.image_id
    }));
  };

  const handleImageDelete = async (imageId) => {
    try {
      debugLog('Deleting image...', { imageId });
      await imageService.deleteImage(imageId);
      setUserImages(prev => prev.filter(img => img.id !== imageId));
      debugLog('Image deleted successfully');
    } catch (error) {
      console.error('Error deleting image:', error);
      debugLog('Delete error:', error);
    }
  };

  const handleShare = async () => {
    try {
      setIsGettingShareLink(true);
      debugLog('Getting share link...');
      
      const shareData = await userService.getShareLink();
      
      // Extract share URL from response (could be share_url, additionalProp1, etc.)
      const url = shareData.share_url || shareData.additionalProp1 || shareData.additionalProp2 || shareData.additionalProp3;
      
      if (url) {
        setShareLink(url);
        setShowShareModal(true);
        debugLog('Share link obtained:', url);
      } else {
        throw new Error('No share URL found in response');
      }
    } catch (error) {
      console.error('Error getting share link:', error);
      debugLog('Share link error:', error);
      showError('Failed to get share link. Please try again.');
    } finally {
      setIsGettingShareLink(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      success('Share link copied to clipboard!');
      console.log('Share link copied to clipboard');
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = shareLink;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      success('Share link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="loading-spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-error">
        <h2>Error loading profile</h2>
        <p>{error}</p>
        <button onClick={loadUserProfile} className="retry-btn">
          Try Again
        </button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-error">
        <h2>User not found</h2>
        <p>Unable to load user profile</p>
      </div>
    );
  }

  return (
    <div className="profile">
      <div className="profile-header">
        <div className="profile-info">
          <div className="profile-avatar">
            {user?.profile_picture_url ? (
              <img 
                src={user.profile_picture_url} 
                alt={user.username || user.name || 'Usuario'}
                className="profile-avatar-image"
              />
            ) : (
              (user?.username?.[0] || user?.name?.[0] || 'U').toUpperCase()
            )}
          </div>
          <div className="profile-details">
            <h1>{user?.username || user?.name || 'Usuario'}</h1>
            <p className="profile-bio">{user?.bio || 'Sin biografía'}</p>
            <div className="profile-stats">
              <div className="stat">
                <span className="stat-number">{userImages.length}</span>
                <span className="stat-label">Images</span>
              </div>
            </div>
          </div>
        </div>
        <div className="profile-actions">
          <button 
            onClick={handleShare} 
            className="share-btn"
            disabled={isGettingShareLink}
          >
            <Share size={20} />
            {isGettingShareLink ? 'Getting link...' : 'Share'}
          </button>
          <Link to="/settings" className="settings-btn">
            <Settings size={20} />
            Settings
          </Link>
        </div>
      </div>

      <div className="profile-content">
        <div className="profile-nav">
          <button className="nav-btn active">
            <Grid3x3 size={16} />
            Images
          </button>
        </div>

        <div className="profile-grid">
          {userImages.map((image) => (
            <ImageCard
              key={image.id}
              image={image}
              onDelete={handleImageDelete}
              currentUserId={currentUserId}
            />
          ))}
        </div>

        {userImages.length === 0 && (
          <div className="empty-profile">
            <p>You don't have any images yet</p>
            <p className="empty-subtitle">
              Share your first image to start your gallery
            </p>
          </div>
        )}
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="share-modal-overlay" onClick={() => setShowShareModal(false)}>
          <div className="share-modal" onClick={(e) => e.stopPropagation()}>
            <div className="share-modal-header">
              <h3>Share Profile</h3>
              <button 
                className="close-btn" 
                onClick={() => setShowShareModal(false)}
              >
                ×
              </button>
            </div>
            <div className="share-modal-content">
              <p>Share this link so others can view your profile:</p>
              <div className="share-link-container">
                <input 
                  type="text" 
                  value={shareLink} 
                  readOnly 
                  className="share-link-input"
                />
                <button 
                  onClick={copyToClipboard} 
                  className="copy-btn"
                >
                  Copy
                </button>
              </div>
              <p className="share-note">
                People with this link will be able to view your profile and images without logging in.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
