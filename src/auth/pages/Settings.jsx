import { useState, useEffect } from 'react';
import { User, Lock } from 'lucide-react';
import { userService } from '../services/userService';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../hooks/useToast';
import './Settings.css';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  const { refreshUser } = useAuth();
  const toast = useToast();
  const [formData, setFormData] = useState({
    username: '',
    bio: '',
    profile_picture_url: ''
  });
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [showProfilePictureMenu, setShowProfilePictureMenu] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Bio word limit
  const BIO_WORD_LIMIT = 50;

  // Helper function to count words
  const countWords = (text) => {
    if (!text || text.trim() === '') return 0;
    return text.trim().split(/\s+/).length;
  };

  // Helper function to get remaining words
  const getRemainingWords = () => {
    const currentWords = countWords(formData.bio);
    return BIO_WORD_LIMIT - currentWords;
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
  ];

  useEffect(() => {
    const loadUserData = async () => {
      setIsLoading(true);
      try {
        const userData = await userService.getCurrentUser();
        setFormData({
          username: userData.username || '',
          bio: userData.bio || '',
          profile_picture_url: userData.profile_picture_url || ''
        });
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('Failed to load user data');
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, []);

  const handleInputChange = (field, value) => {
    // Check word limit for bio field
    if (field === 'bio') {
      const wordCount = countWords(value);
      if (wordCount > BIO_WORD_LIMIT) {
        toast.error(`Bio cannot exceed ${BIO_WORD_LIMIT} words`);
        return; // Don't update if over limit
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleProfileImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setProfileImageFile(file);
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setProfileImagePreview(previewUrl);
    }
  };

  const handlePasswordChange = (field, value) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRemoveProfilePicture = async () => {
    setIsLoading(true);

    try {
      // Limpiar preview si existe
      if (profileImagePreview) {
        URL.revokeObjectURL(profileImagePreview);
        setProfileImagePreview(null);
      }
      setProfileImageFile(null);
      
      // Llamar al servicio para generar y subir avatar por defecto
      const result = await userService.removeProfilePicture();
      
      // Actualizar formData con la nueva URL del avatar por defecto
      setFormData(prev => ({
        ...prev,
        profile_picture_url: result.profile_picture_url || ''
      }));
      
      toast.success('Profile picture removed and default avatar set successfully!');
      
      // Refrescar el usuario en el contexto para actualizar toda la interfaz
      await refreshUser();
    } catch (error) {
      console.error('Error removing profile picture:', error);
      toast.error(error.response?.data?.message || 'Failed to remove profile picture. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);

    try {
      // Preparar datos para el update
      const updateData = {
        username: formData.username,
        bio: formData.bio
      };

      // Si hay una imagen nueva, agregarla
      if (profileImageFile) {
        updateData.profile_picture = profileImageFile;
      }

      // Actualizar perfil usando FormData
      const result = await userService.updateUser(updateData);

      toast.success('Profile updated successfully!');
      
      // Limpiar selección de archivo
      setProfileImageFile(null);
      setProfileImagePreview(null);
      
      // Actualizar formData si la respuesta incluye nueva URL de imagen
      if (result && result.profile_picture_url) {
        setFormData(prev => ({
          ...prev,
          profile_picture_url: result.profile_picture_url
        }));
      }

      // Refrescar el usuario en el contexto para actualizar el sidebar
      await refreshUser();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSave = async () => {
    setIsLoading(true);

    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error('Please fill in all password fields.');
      setIsLoading(false);
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match.');
      setIsLoading(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long.');
      setIsLoading(false);
      return;
    }

    try {
      await userService.updateUser({
        password: passwordData.newPassword
      });

      toast.success('Password changed successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error('Error changing password. Please check your current password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      username: '',
      bio: '',
      profile_picture_url: ''
    });
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setProfileImageFile(null);
    setProfileImagePreview(null);
  };

  const renderProfileTab = () => (
    <div className="settings-section">
      <h3>Profile Information</h3>
      
      {/* Profile Picture - Clickable with smaller size */}
      <div className="form-group">
        <label>Profile Picture</label>
        <div className="profile-picture-section">
          <div 
            className="profile-picture-clickable"
            onClick={() => setShowProfilePictureMenu(true)}
          >
            {(profileImagePreview || formData.profile_picture_url) ? (
              <img 
                src={profileImagePreview || formData.profile_picture_url} 
                alt="Profile preview" 
                className="profile-picture-small"
              />
            ) : (
              <div className="profile-picture-placeholder">
                <span>{formData.username?.[0]?.toUpperCase() || 'U'}</span>
              </div>
            )}
          </div>
        </div>

        {/* Profile Picture Menu Popup */}
        {showProfilePictureMenu && (
          <>
            <div 
              className="profile-menu-overlay" 
              onClick={() => setShowProfilePictureMenu(false)}
            ></div>
            <div className="profile-picture-menu">
              <input
                type="file"
                id="profile-picture-hidden"
                accept="image/*"
                onChange={handleProfileImageChange}
                style={{ display: 'none' }}
              />
              <button 
                className="profile-menu-item change"
                onClick={() => {
                  document.getElementById('profile-picture-hidden').click();
                  setShowProfilePictureMenu(false);
                }}
              >
                Change Picture
              </button>
              
              {(profileImagePreview || formData.profile_picture_url) && (
                <button 
                  className="profile-menu-item remove"
                  onClick={() => {
                    handleRemoveProfilePicture();
                    setShowProfilePictureMenu(false);
                  }}
                  disabled={isLoading}
                >
                  Remove Profile Picture
                </button>
              )}
              
              <button 
                className="profile-menu-item cancel"
                onClick={() => setShowProfilePictureMenu(false)}
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </div>

      {/* Username field */}
      <div className="form-group">
        <label>Username</label>
        <input
          type="text"
          value={formData.username}
          onChange={(e) => handleInputChange('username', e.target.value)}
          placeholder="Your username"
        />
      </div>
      
      {/* Biography field */}
      <div className="form-group">
        <label>Biography</label>
        <div className="bio-input-container">
          <textarea
            value={formData.bio}
            onChange={(e) => handleInputChange('bio', e.target.value)}
            placeholder="Tell us about yourself..."
            rows="4"
          />
          <div className={`bio-word-counter ${getRemainingWords() < 0 ? 'over-limit' : ''}`}>
            {countWords(formData.bio)}/{BIO_WORD_LIMIT} words
          </div>
        </div>
      </div>
    </div>
  );

  const renderSecurityTab = () => (
    <div className="settings-section">
      <h3>Change Password</h3>
      <div className="form-group">
        <label>Current Password</label>
        <input
          type="password"
          value={passwordData.currentPassword}
          onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
          placeholder="Enter your current password"
        />
      </div>
      <div className="form-group">
        <label>New Password</label>
        <input
          type="password"
          value={passwordData.newPassword}
          onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
          placeholder="Enter new password (min. 6 characters)"
        />
      </div>
      <div className="form-group">
        <label>Confirm New Password</label>
        <input
          type="password"
          value={passwordData.confirmPassword}
          onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
          placeholder="Confirm your new password"
        />
      </div>
      <div className="password-actions">
        <button 
          className="save-btn" 
          onClick={handlePasswordSave}
          disabled={isLoading}
        >
          {isLoading ? 'Changing...' : 'Change Password'}
        </button>
      </div>
    </div>
  );

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'profile': return renderProfileTab();
      case 'security': return renderSecurityTab();
      default: return renderProfileTab();
    }
  };

  return (
    <div className="settings">
      <div className="settings-header">
        <h1>Settings</h1>
      </div>

      <div className="settings-content">
        <div className="settings-sidebar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon size={20} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="settings-main">
          {renderActiveTab()}
          
          {activeTab === 'profile' && (
            <div className="settings-actions">
              <button 
                className="save-btn" 
                onClick={handleSave}
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
              <button 
                className="cancel-btn"
                onClick={handleCancel}
                disabled={isLoading}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
