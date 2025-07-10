import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Grid3x3, 
  Settings,
  Menu,
  X,
  LogOut,
  MoreHorizontal
} from 'lucide-react';
import { useAuth } from '../../auth/contexts/AuthContext';
import { debugLog } from '../../config';
import './Sidebar.css';

const Sidebar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const moreMenuRef = useRef(null);
  const location = useLocation();
  const { user, logout } = useAuth();

  // Debug: Log user data to see what we're getting
  useEffect(() => {
    debugLog('Sidebar user data:', user);
  }, [user]);

  // Handle click outside to close more menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target)) {
        setShowMoreMenu(false);
      }
    };

    if (showMoreMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMoreMenu]);

  const navigationItems = [
    { icon: Grid3x3, label: 'FEED', path: '/', id: 'feed' },
    { 
      icon: null, // Will use user avatar
      label: 'PROFILE', 
      path: '/profile', 
      id: 'profile',
      isProfile: true 
    },
  ];

  const handleLogout = () => {
    logout();
    closeMobileMenu();
    setShowMoreMenu(false);
  };

  const toggleMoreMenu = () => {
    setShowMoreMenu(!showMoreMenu);
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
    setShowMoreMenu(false);
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="mobile-header">
        <div className="mobile-logo">
          <img src="/OSITO_WHITE.png" alt="OSOHUB Logo" className="logo-image" />
          <span className="logo-text">OSOHUB</span>
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
          <img src="/OSITO_WHITE.png" alt="OSOHUB Logo" className="logo-image" />
          <span className="logo-text">OSOHUB</span>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {navigationItems.map((item) => {
            if (item.isProfile) {
              // Profile navigation item with user avatar
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
                  onClick={closeMobileMenu}
                >
                  <div className="nav-avatar">
                    {user && user.profile_picture_url && 
                     user.profile_picture_url !== 'null' && 
                     user.profile_picture_url !== '' && 
                     user.profile_picture_url !== 'undefined' ? (
                      <img 
                        src={user.profile_picture_url} 
                        alt={user.username || 'Usuario'}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextElementSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <span 
                      style={{ 
                        display: user && user.profile_picture_url && 
                                user.profile_picture_url !== 'null' && 
                                user.profile_picture_url !== '' && 
                                user.profile_picture_url !== 'undefined' ? 'none' : 'flex' 
                      }}
                    >
                      {(user?.username || user?.name || 'U')[0]?.toUpperCase()}
                    </span>
                  </div>
                  <span>{item.label}</span>
                </Link>
              );
            } else {
              // Regular navigation item
              const Icon = item.icon;
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
                  onClick={closeMobileMenu}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </Link>
              );
            }
          })}
          
          {/* More Menu */}
          <div className="sidebar-footer">
            <div className="more-menu-container" ref={moreMenuRef}>
              <button 
                className="nav-item more-btn" 
                onClick={toggleMoreMenu}
              >
                <MoreHorizontal size={20} />
                <span>MORE</span>
              </button>
              
              {showMoreMenu && (
                <div className="more-menu">
                  <Link 
                    to="/settings" 
                    className="more-menu-item"
                    onClick={closeMobileMenu}
                  >
                    <Settings size={16} />
                    <span>Settings</span>
                  </Link>
                  <button 
                    className="more-menu-item logout-item" 
                    onClick={handleLogout}
                  >
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
