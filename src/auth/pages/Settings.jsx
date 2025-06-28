import { useState, useEffect } from 'react';
import { User, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import { userService } from '../services/userService';
import { useAuth } from '../../contexts/AuthContext';
import './Settings.css';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const { refreshUser } = useAuth(); // Obtener refreshUser del contexto
  const [formData, setFormData] = useState({
    username: '',
    bio: '',
    profile_picture_url: ''
  });
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

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
        setMessage({ type: 'error', text: 'Failed to load user data' });
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, []);

  const handleInputChange = (field, value) => {
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
    setMessage({ type: '', text: '' });

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
      
      setMessage({ 
        type: 'success', 
        text: 'Profile picture removed and default avatar set successfully!' 
      });
      
      // Refrescar el usuario en el contexto para actualizar toda la interfaz
      await refreshUser();
    } catch (error) {
      console.error('Error removing profile picture:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to remove profile picture. Please try again.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    setMessage({ type: '', text: '' });

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

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      
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
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to update profile. Please try again.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSave = async () => {
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'Please fill in all password fields.' });
      setIsLoading(false);
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match.' });
      setIsLoading(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'New password must be at least 6 characters long.' });
      setIsLoading(false);
      return;
    }

    try {
      await userService.updateUser({
        password: passwordData.newPassword
      });

      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Error changing password:', error);
      setMessage({ 
        type: 'error', 
        text: 'Error changing password. Please check your current password.' 
      });
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
    setMessage({ type: '', text: '' });
  };

  const renderProfileTab = () => (
    <div className="settings-section">
      <h3>Profile Information</h3>
      <div className="form-group">
        <label>Username</label>
        <input
          type="text"
          value={formData.username}
          onChange={(e) => handleInputChange('username', e.target.value)}
          placeholder="Your username"
        />
      </div>
      <div className="form-group">
        <label>Biography</label>
        <textarea
          value={formData.bio}
          onChange={(e) => handleInputChange('bio', e.target.value)}
          placeholder="Tell us about yourself..."
          rows="4"
        />
      </div>
      <div className="form-group">
        <label>Profile Picture</label>
        <div className="profile-picture-upload">
          <div className="avatar-upload-container">
            <div className="avatar-preview">
              {(profileImagePreview || formData.profile_picture_url) ? (
                <img 
                  src={profileImagePreview || formData.profile_picture_url} 
                  alt="Profile preview" 
                  className="avatar-image"
                />
              ) : (
                <div className="avatar-placeholder">
                  <span>{formData.username?.[0]?.toUpperCase() || 'U'}</span>
                </div>
              )}
              <div className="avatar-overlay">
                <input
                  type="file"
                  id="profile-picture"
                  accept="image/*"
                  onChange={handleProfileImageChange}
                  style={{ display: 'none' }}
                />
                <label htmlFor="profile-picture" className="avatar-upload-btn">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 19V5C21 3.9 20.1 3 19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19ZM8.5 13.5L11 16.51L14.5 12L19 18H5L8.5 13.5Z" fill="currentColor"/>
                  </svg>
                  <span>Change Photo</span>
                </label>
              </div>
            </div>
            {(profileImagePreview || formData.profile_picture_url) && (
              <button 
                type="button" 
                className="remove-avatar-btn"
                onClick={handleRemoveProfilePicture}
                disabled={isLoading}
                title="Remove profile picture and set default"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="currentColor"/>
                </svg>
              </button>
            )}
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
          {message.text && (
            <div className={`message ${message.type}`}>
              {message.type === 'success' ? (
                <CheckCircle size={20} />
              ) : (
                <AlertCircle size={20} />
              )}
              <span>{message.text}</span>
            </div>
          )}

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
