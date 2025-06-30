import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Settings, Grid3x3 } from 'lucide-react';
import ImageCard from '../../images/components/ImageCard';
import { imageService } from '../../images/services/imageService';
import { userService } from '../services/userService';
import { getCurrentUserId, debugLog } from '../../config';
import './Profile.css';

const Profile = () => {
  const [userImages, setUserImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

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
          </div>
        </div>
        <div className="profile-actions">
          <Link to="/settings" className="edit-profile-btn">
            Edit Profile
          </Link>
          <Link to="/settings" className="settings-btn">
            <Settings size={16} />
            Settings
          </Link>
        </div>
      </div>

      <div className="profile-content">
        <div className="profile-nav">
          <button className="nav-btn active">
            RECENT
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
    </div>
  );
};

export default Profile;
