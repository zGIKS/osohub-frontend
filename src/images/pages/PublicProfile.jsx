import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Grid3x3, ExternalLink } from 'lucide-react';
import ImageCard from '../components/ImageCard';
import FullPostView from '../components/FullPostView';
import { userService } from '../../auth/services/userService';
import { debugLog } from '../../config';
import './PublicProfile.css';

const PublicProfile = () => {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showFullPost, setShowFullPost] = useState(false);

  useEffect(() => {
    if (username) {
      loadPublicProfile();
    }
  }, [username]);

  const loadPublicProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      debugLog('Loading public profile...', { username });
      
      const profileData = await userService.getPublicProfile(username);
      
      debugLog('Public profile data loaded:', profileData);
      
      // The API might return different structures, adapt as needed
      setProfile(profileData.user || profileData);
      
      // Transform images to match expected format
      const transformedImages = (profileData.images || []).map(img => ({
        id: img.image_id || img.id,
        url: img.image_url || img.url || 'https://via.placeholder.com/400x400?text=No+Image',
        title: img.title,
        description: img.title,
        userId: img.user_id,
        user: {
          username: profileData.user?.username || profileData.username || username,
          profile_picture_url: profileData.user?.profile_picture_url || profileData.profile_picture_url
        },
        likeCount: img.like_count || 0,
        isLiked: false, // Public profiles don't show like status
        createdAt: img.uploaded_at || img.createdAt
      }));
      
      setImages(transformedImages);
      
    } catch (error) {
      console.error('Error loading public profile:', error);
      debugLog('Public profile loading error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      
      if (error.response?.status === 404) {
        setError('User not found');
      } else {
        setError('Failed to load profile');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleImageClick = (image) => {
    setSelectedImage(image);
    setShowFullPost(true);
  };

  const handleFullPostClose = () => {
    setShowFullPost(false);
    setSelectedImage(null);
  };

  const handleNavigate = (direction) => {
    if (!selectedImage) return;
    
    const currentIndex = images.findIndex(img => img.id === selectedImage.id);
    let newIndex;
    
    if (direction === 'prev') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : images.length - 1;
    } else {
      newIndex = currentIndex < images.length - 1 ? currentIndex + 1 : 0;
    }
    
    setSelectedImage(images[newIndex]);
  };

  if (loading) {
    return (
      <div className="public-profile-loading">
        <div className="loading-spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="public-profile-error">
        <h2>😞 Oops!</h2>
        <p>{error}</p>
        <button onClick={loadPublicProfile} className="retry-btn">
          Try Again
        </button>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="public-profile-error">
        <h2>Profile not found</h2>
        <p>This user doesn't exist or their profile is not available.</p>
      </div>
    );
  }

  return (
    <div className="public-profile">
      <div className="public-profile-header">
        <div className="public-profile-info">
          <div className="public-profile-avatar">
            {profile?.profile_picture_url ? (
              <img 
                src={profile.profile_picture_url} 
                alt={profile.username || profile.name || 'User'}
                className="public-profile-avatar-image"
              />
            ) : (
              (profile?.username?.[0] || profile?.name?.[0] || 'U').toUpperCase()
            )}
          </div>
          <div className="public-profile-details">
            <h1>{profile?.username || profile?.name || 'Unknown User'}</h1>
            <p className="public-profile-bio">{profile?.bio || 'No bio available'}</p>
            <div className="public-profile-stats">
              <div className="stat">
                <span className="stat-number">{images.length}</span>
                <span className="stat-label">Images</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="public-profile-badge">
          <ExternalLink size={16} />
          <span>Public Profile</span>
        </div>
      </div>

      <div className="public-profile-content">
        <div className="public-profile-nav">
          <button className="nav-btn active">
            <Grid3x3 size={16} />
            Images
          </button>
        </div>

        <div className="public-profile-grid">
          {images.map((image) => (
            <ImageCard
              key={image.id}
              image={image}
              currentUserId={null} // No user actions in public profile
              onDelete={null}
              onClick={handleImageClick}
            />
          ))}
        </div>

        {images.length === 0 && (
          <div className="empty-public-profile">
            <p>This user hasn't shared any images yet</p>
            <p className="empty-subtitle">
              Check back later to see their content
            </p>
          </div>
        )}
      </div>

      {/* Full Post View */}
      {showFullPost && selectedImage && (
        <FullPostView
          image={selectedImage}
          images={images}
          onClose={handleFullPostClose}
          onNavigate={handleNavigate}
          currentUserId={null} // No user actions in public profile
        />
      )}
    </div>
  );
};

export default PublicProfile;
