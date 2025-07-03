import { useState, useEffect } from 'react';
import { User, Lock } from 'lucide-react';
import { userService } from '../services/userService';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/useToast';
import { debugLog } from '../../config';
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
  const [originalFormData, setOriginalFormData] = useState({
    username: '',
    bio: '',
    profile_picture_url: ''
  });
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [isProfilePictureRemoved, setIsProfilePictureRemoved] = useState(false);
  const [lastBioErrorType, setLastBioErrorType] = useState(null);
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
        const userFormData = {
          username: userData.username || '',
          bio: userData.bio || '',
          profile_picture_url: userData.profile_picture_url || ''
        };
        setFormData(userFormData);
        setOriginalFormData(userFormData); // Guardar datos originales para comparación
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
    // Validar biografía con múltiples restricciones
    if (field === 'bio') {
      let errorType = null;
      
      // 1. Límite de caracteres totales (500 caracteres máximo)
      if (value.length > 500) {
        errorType = 'char_limit';
        if (lastBioErrorType !== errorType) {
          toast.error('Biography cannot exceed 500 characters.');
          setLastBioErrorType(errorType);
        }
        return;
      }

      // 2. Contar palabras y validar longitud máxima por palabra
      const words = value.trim().split(/\s+/).filter(word => word.length > 0);
      const wordCount = words.length;

      // 3. Verificar que ninguna palabra sea demasiado larga (30 caracteres máximo por palabra)
      const longWords = words.filter(word => word.length > 30);
      if (longWords.length > 0) {
        errorType = 'long_word';
        if (lastBioErrorType !== errorType) {
          toast.error(`Words cannot exceed 30 characters. Found: "${longWords[0].substring(0, 20)}..."`);
          setLastBioErrorType(errorType);
        }
        return;
      }

      // 4. Límite de palabras (50 palabras máximo)
      if (wordCount > 50) {
        errorType = 'word_limit';
        if (lastBioErrorType !== errorType) {
          toast.error('Biography cannot exceed 50 words.');
          setLastBioErrorType(errorType);
        }
        return;
      }

      // 5. Verificar que no sea solo espacios o caracteres repetitivos
      const cleanText = value.trim().replace(/\s+/g, ' ');
      if (cleanText.length > 0) {
        // Detectar texto repetitivo (más del 70% del mismo carácter)
        const charCount = {};
        let maxCharCount = 0;
        for (let char of cleanText.toLowerCase()) {
          if (char !== ' ') {
            charCount[char] = (charCount[char] || 0) + 1;
            maxCharCount = Math.max(maxCharCount, charCount[char]);
          }
        }
        const nonSpaceChars = cleanText.replace(/\s/g, '').length;
        if (nonSpaceChars > 10 && (maxCharCount / nonSpaceChars) > 0.7) {
          errorType = 'repetitive';
          if (lastBioErrorType !== errorType) {
            toast.error('Biography contains too many repeated characters. Please write meaningful content.');
            setLastBioErrorType(errorType);
          }
          return;
        }
      }

      // Si llegamos aquí, no hay errores, limpiar el último error
      if (lastBioErrorType !== null) {
        setLastBioErrorType(null);
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
      // Reset the remove flag since user is selecting a new image
      setIsProfilePictureRemoved(false);
      // Show toast notification
      toast.success('New profile picture selected. Click "Save Changes" to apply.');
    }
  };

  const handlePasswordChange = (field, value) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRemoveProfilePicture = () => {
    // Solo limpiar preview y marcar para eliminación, no hacer el update inmediatamente
    if (profileImagePreview) {
      URL.revokeObjectURL(profileImagePreview);
      setProfileImagePreview(null);
    }
    setProfileImageFile(null);
    setIsProfilePictureRemoved(true);
    // Show toast notification
    toast.success('Profile picture will be removed. Click "Save Changes" to apply.');
  };

  const handleSave = async () => {
    setIsLoading(true);

    try {
      // Preparar datos para el update
      const updateData = {};

      // Verificar qué campos han cambiado y agregarlos al updateData
      if (formData.username !== originalFormData.username) {
        updateData.username = formData.username;
      }
      if (formData.bio !== originalFormData.bio) {
        updateData.bio = formData.bio;
      }

      // Si se marcó para eliminar la foto de perfil
      if (isProfilePictureRemoved) {
        // Llamar al servicio para generar y subir avatar por defecto
        const result = await userService.removeProfilePicture();
        
        // Actualizar formData con la nueva URL del avatar por defecto
        const newFormData = {
          ...formData,
          profile_picture_url: result.profile_picture_url || ''
        };
        setFormData(newFormData);
        setOriginalFormData(newFormData);
        
        setIsProfilePictureRemoved(false);
        toast.success('Profile picture removed and default avatar set successfully!');
      }
      // Si hay una imagen nueva, agregarla
      else if (profileImageFile) {
        updateData.profile_picture = profileImageFile;
      }

      // Solo hacer update de usuario si hay datos que actualizar
      if (Object.keys(updateData).length > 0) {
        debugLog('Updating user with data:', updateData);
        
        const result = await userService.updateUser(updateData);
        
        // Actualizar formData si la respuesta incluye nueva URL de imagen
        let newFormData = { ...formData };
        if (result && result.profile_picture_url) {
          newFormData.profile_picture_url = result.profile_picture_url;
          setFormData(newFormData);
        }
        
        // Actualizar datos originales para futuras comparaciones
        setOriginalFormData(newFormData);
        
        toast.success('Profile updated successfully!');
      } else if (!isProfilePictureRemoved) {
        toast.info('No changes to save.');
      }
      
      // Limpiar selección de archivo
      setProfileImageFile(null);
      setProfileImagePreview(null);

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
    // Restaurar datos originales
    setFormData({ ...originalFormData });
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setProfileImageFile(null);
    setProfileImagePreview(null);
    setIsProfilePictureRemoved(false);
    setLastBioErrorType(null); // Resetear estado de errores
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
        <div className="bio-word-count">
          {(() => {
            const words = formData.bio.trim().split(/\s+/).filter(word => word.length > 0);
            const wordCount = formData.bio.trim() === '' ? 0 : words.length;
            const charCount = formData.bio.length;
            const isWordOverLimit = wordCount > 50;
            const isCharOverLimit = charCount > 500;
            const hasLongWords = words.some(word => word.length > 30);
            
            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <span style={{ 
                  fontSize: '0.8rem', 
                  color: isWordOverLimit ? '#ef4444' : 'var(--text-secondary)',
                  fontWeight: isWordOverLimit ? '500' : 'normal'
                }}>
                  Words: {wordCount}/50
                  {isWordOverLimit && ' (exceeds limit)'}
                </span>
                <span style={{ 
                  fontSize: '0.8rem', 
                  color: isCharOverLimit ? '#ef4444' : 'var(--text-secondary)',
                  fontWeight: isCharOverLimit ? '500' : 'normal'
                }}>
                  Characters: {charCount}/500
                  {isCharOverLimit && ' (exceeds limit)'}
                </span>
                {hasLongWords && (
                  <span style={{ 
                    fontSize: '0.75rem', 
                    color: '#ef4444',
                    fontWeight: '500'
                  }}>
                    ⚠️ Some words are too long (max 30 characters per word)
                  </span>
                )}
              </div>
            );
          })()}
        </div>
      </div>
      <div className="form-group">
        <label>Profile Picture</label>
        <div className="profile-picture-upload">
          <div className="avatar-upload-container">
            <div className="avatar-preview">
              {profileImagePreview ? (
                // Mostrar imagen nueva seleccionada
                <img 
                  src={profileImagePreview} 
                  alt="Profile preview" 
                  className="avatar-image"
                />
              ) : isProfilePictureRemoved ? (
                // Mostrar avatar placeholder si se marcó para eliminación
                <div className="avatar-placeholder">
                  <span>{formData.username?.[0]?.toUpperCase() || 'U'}</span>
                </div>
              ) : formData.profile_picture_url ? (
                // Mostrar imagen actual del usuario
                <img 
                  src={formData.profile_picture_url} 
                  alt="Profile preview" 
                  className="avatar-image"
                />
              ) : (
                // Mostrar placeholder por defecto
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
            {(profileImagePreview || (formData.profile_picture_url && !isProfilePictureRemoved)) && (
              <button 
                type="button" 
                className="remove-avatar-btn"
                onClick={handleRemoveProfilePicture}
                disabled={isLoading}
                title="Remove profile picture"
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
