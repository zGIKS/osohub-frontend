import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Settings, Grid3x3 } from 'lucide-react';
import ImageCard from '../../images/components/ImageCard';
import { imageService } from '../../images/services/imageService';
import { userService } from '../services/userService';
import './Profile.css';

const Profile = () => {
  const [userImages, setUserImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // Mock current user - in a real app, this would come from auth context
  const currentUserId = localStorage.getItem('currentUserId') || '1';

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      
      // Load user data from API
      const userData = await userService.getCurrentUser();
      setUser(userData);

      // Load user's images
      const images = await imageService.getUserImages(currentUserId);
      setUserImages(images);
    } catch (error) {
      console.error('Error loading profile:', error);
      
      // Fallback to mock data if API fails
      const mockUser = {
        id: currentUserId,
        username: 'photographer1',
        email: 'photographer1@example.com',
        bio: 'Passionate photographer capturing life\'s beautiful moments',
        profile_picture_url: null,
        followerCount: 1234,
        followingCount: 567,
        imageCount: 42
      };

      const mockImages = [
        {
          id: '1',
          url: 'https://picsum.photos/400/400?random=1',
          description: 'Beautiful sunset over the mountains',
          userId: currentUserId,
          user: mockUser,
          likeCount: 15,
          isLiked: false,
          createdAt: new Date().toISOString()
        },
        {
          id: '4',
          url: 'https://picsum.photos/400/400?random=4',
          description: 'Nature photography at its finest',
          userId: currentUserId,
          user: mockUser,
          likeCount: 8,
          isLiked: true,
          createdAt: new Date().toISOString()
        }
      ];

      setUser(mockUser);
      setUserImages(mockImages);
    } finally {
      setLoading(false);
    }
  };

  const handleImageDelete = (imageId) => {
    setUserImages(prev => prev.filter(img => img.id !== imageId));
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="loading-spinner"></div>
        <p>Loading profile...</p>
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
                alt={user.username}
                className="profile-avatar-image"
              />
            ) : (
              user?.username?.[0]?.toUpperCase() || 'U'
            )}
          </div>
          <div className="profile-details">
            <h1>{user?.username}</h1>
            <p className="profile-bio">{user?.bio}</p>
            <div className="profile-stats">
              <div className="stat">
                <span className="stat-number">{user?.imageCount}</span>
                <span className="stat-label">Images</span>
              </div>
              <div className="stat">
                <span className="stat-number">{user?.followerCount}</span>
                <span className="stat-label">Followers</span>
              </div>
              <div className="stat">
                <span className="stat-number">{user?.followingCount}</span>
                <span className="stat-label">Following</span>
              </div>
            </div>
          </div>
        </div>
        <Link to="/settings" className="settings-btn">
          <Settings size={20} />
          Settings
        </Link>
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
    </div>
  );
};

export default Profile;
