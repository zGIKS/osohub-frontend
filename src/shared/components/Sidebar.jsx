import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Grid3x3, 
  User, 
  Settings,
  Menu,
  X,
  LogOut,
  MoreHorizontal
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { debugLog } from '../../config';
import './Sidebar.css';

const Sidebar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  // Debug: Log user data to see what we're getting
  useEffect(() => {
    debugLog('Sidebar user data:', user);
  }, [user]);

  // Component for rendering profile avatar
  const ProfileAvatar = ({ size = 20 }) => {
    if (user?.profile_picture_url && 
        user.profile_picture_url !== 'null' && 
        user.profile_picture_url !== '' && 
        user.profile_picture_url !== 'undefined') {
      return (
        <img 
          src={user.profile_picture_url} 
          alt={user.username || 'Profile'}
          className="profile-nav-avatar"
          style={{ width: size, height: size }}
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextElementSibling.style.display = 'flex';
          }}
        />
      );
    }
    return (
      <span 
        className="profile-nav-fallback"
        style={{ 
          width: size, 
          height: size,
          fontSize: `${size * 0.6}px`
        }}
      >
        {(user?.username || user?.name || 'U')[0]?.toUpperCase()}
      </span>
    );
  };

  const navigationItems = [
    { icon: Grid3x3, label: 'FEED', path: '/', id: 'feed' },
    { icon: User, label: 'PROFILE', path: '/profile', id: 'profile', isProfile: true },
  ];

  const moreMenuItems = [
    { icon: Settings, label: 'SETTINGS', path: '/settings', id: 'settings' },
    { icon: LogOut, label: 'LOGOUT', id: 'logout', isLogout: true },
  ];

  const handleLogout = () => {
    logout();
    closeMobileMenu();
    setIsMoreMenuOpen(false);
  };

  const toggleMoreMenu = () => {
    setIsMoreMenuOpen(!isMoreMenuOpen);
  };

  const closeMoreMenu = () => {
    setIsMoreMenuOpen(false);
  };

  const handleMoreMenuItemClick = (item) => {
    if (item.isLogout) {
      handleLogout();
    } else {
      closeMobileMenu();
      closeMoreMenu();
    }
  };

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>        {/* Mobile Header */}
        <div className="mobile-header">
          <div className="mobile-logo">
            <div className="logo-icon-simple">
              <img src="/OSITO_WHITE.png" alt="OSOHUB Logo" className="logo-image" />
            </div>
          </div>
        <button className="mobile-menu-btn" onClick={toggleMobileMenu}>
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div className="mobile-overlay" onClick={closeMobileMenu}></div>
      )}

      {/* Sidebar */}
      <div className={`sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        {/* Desktop Logo */}
        <div className="sidebar-logo">
          <div className="logo-icon-simple">
            <img src="/OSITO_WHITE.png" alt="OSOHUB Logo" className="logo-image" />
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.id}
                to={item.path}
                className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
                onClick={closeMobileMenu}
              >
                {item.isProfile ? (
                  <ProfileAvatar size={20} />
                ) : (
                  <Icon size={20} />
                )}
                <span>{item.label}</span>
              </Link>
            );
          })}
          
          {/* More Menu */}
          <div className="sidebar-footer">
            <div className="more-menu-container">
              <button 
                className={`nav-item more-menu-btn ${isMoreMenuOpen ? 'active' : ''}`}
                onClick={toggleMoreMenu}
              >
                <Menu size={20} />
                <span>MORE</span>
              </button>
              
              {isMoreMenuOpen && (
                <>
                  <div className="more-menu-overlay" onClick={closeMoreMenu}></div>
                  <div className="more-menu">
                    {moreMenuItems.map((item) => {
                      const Icon = item.icon;
                      if (item.isLogout) {
                        return (
                          <button
                            key={item.id}
                            className="more-menu-item"
                            onClick={() => handleMoreMenuItemClick(item)}
                          >
                            <Icon size={18} />
                            <span>{item.label}</span>
                          </button>
                        );
                      }
                      return (
                        <Link
                          key={item.id}
                          to={item.path}
                          className={`more-menu-item ${item.iconOnly ? 'icon-only' : ''}`}
                          onClick={() => handleMoreMenuItemClick(item)}
                        >
                          <Icon size={18} />
                          {!item.iconOnly && <span>{item.label}</span>}
                        </Link>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
