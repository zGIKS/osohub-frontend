import { useState } from 'react';
import { User, Mail, Lock, Bell, Shield, Trash2 } from 'lucide-react';
import './Settings.css';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    bio: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    notifications: {
      likes: true,
      follows: true,
      comments: true,
      email: false
    }
  });

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'account', label: 'Account', icon: Mail },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Shield },
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNotificationChange = (type, value) => {
    setFormData(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [type]: value
      }
    }));
  };

  const handleSave = () => {
    // Here you would implement the logic to save changes
    console.log('Saving settings:', formData);
    alert('Settings saved successfully');
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
    </div>
  );

  const renderAccountTab = () => (
    <div className="settings-section">
      <h3>Account Information</h3>
      <div className="form-group">
        <label>Email</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          placeholder="your@email.com"
        />
      </div>
      <div className="danger-zone">
        <h4>Danger Zone</h4>
        <button className="danger-btn">
          <Trash2 size={16} />
          Delete Account
        </button>
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
          value={formData.currentPassword}
          onChange={(e) => handleInputChange('currentPassword', e.target.value)}
          placeholder="Your current password"
        />
      </div>
      <div className="form-group">
        <label>New Password</label>
        <input
          type="password"
          value={formData.newPassword}
          onChange={(e) => handleInputChange('newPassword', e.target.value)}
          placeholder="New password"
        />
      </div>
      <div className="form-group">
        <label>Confirm New Password</label>
        <input
          type="password"
          value={formData.confirmPassword}
          onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
          placeholder="Confirm your new password"
        />
      </div>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="settings-section">
      <h3>Notification Preferences</h3>
      <div className="notification-options">
        <div className="notification-item">
          <label>
            <input
              type="checkbox"
              checked={formData.notifications.likes}
              onChange={(e) => handleNotificationChange('likes', e.target.checked)}
            />
            Likes on your images
          </label>
        </div>
        <div className="notification-item">
          <label>
            <input
              type="checkbox"
              checked={formData.notifications.follows}
              onChange={(e) => handleNotificationChange('follows', e.target.checked)}
            />
            New followers
          </label>
        </div>
        <div className="notification-item">
          <label>
            <input
              type="checkbox"
              checked={formData.notifications.comments}
              onChange={(e) => handleNotificationChange('comments', e.target.checked)}
            />
            Comments
          </label>
        </div>
        <div className="notification-item">
          <label>
            <input
              type="checkbox"
              checked={formData.notifications.email}
              onChange={(e) => handleNotificationChange('email', e.target.checked)}
            />
            Email notifications
          </label>
        </div>
      </div>
    </div>
  );

  const renderPrivacyTab = () => (
    <div className="settings-section">
      <h3>Privacy Settings</h3>
      <div className="privacy-options">
        <div className="privacy-item">
          <h4>Private Profile</h4>
          <p>Only your followers can see your images</p>
          <label className="toggle">
            <input type="checkbox" />
            <span className="slider"></span>
          </label>
        </div>
        <div className="privacy-item">
          <h4>Show in Search</h4>
          <p>Allow other users to find you</p>
          <label className="toggle">
            <input type="checkbox" defaultChecked />
            <span className="slider"></span>
          </label>
        </div>
      </div>
    </div>
  );

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'profile': return renderProfileTab();
      case 'account': return renderAccountTab();
      case 'security': return renderSecurityTab();
      case 'notifications': return renderNotificationsTab();
      case 'privacy': return renderPrivacyTab();
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
          
          <div className="settings-actions">
            <button className="save-btn" onClick={handleSave}>
              Save Changes
            </button>
            <button className="cancel-btn">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
