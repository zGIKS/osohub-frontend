import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Grid3x3, 
  User, 
  Settings,
  Menu,
  X,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { debugLog } from '../../config';
import './Sidebar.css';

const Sidebar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  // Debug: Log user data to see what we're getting
  useEffect(() => {
    debugLog('Sidebar user data:', user);
  }, [user]);

  const navigationItems = [
    { icon: Grid3x3, label: 'FEED', path: '/', id: 'feed' },
    { icon: User, label: 'PROFILE', path: '/profile', id: 'profile' },
    { icon: Settings, label: 'SETTINGS', path: '/settings', id: 'settings' },
  ];

  const handleLogout = () => {
    logout();
    closeMobileMenu();
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
    <>
      {/* Mobile Header */}
      <div className="mobile-header">
        <div className="mobile-logo">
          <div className="logo-icon">
            <img src="/OSITO_WHITE.png" alt="OSOHUB Logo" className="logo-image" />
          </div>
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
          <div className="logo-icon">
            <img src="/OSITO_WHITE.png" alt="OSOHUB Logo" className="logo-image" />
          </div>
          <span className="logo-text">OSOHUB</span>
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
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}
          
          {/* User Info and Logout */}
          <div className="sidebar-footer">
            {user && (
              <div className="user-info">
                <div className="user-avatar">
                  {user.profile_picture_url && 
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
                      display: user.profile_picture_url && 
                              user.profile_picture_url !== 'null' && 
                              user.profile_picture_url !== '' && 
                              user.profile_picture_url !== 'undefined' ? 'none' : 'flex' 
                    }}
                  >
                    {(user.username || user.name || 'U')[0]?.toUpperCase()}
                  </span>
                </div>
                <span className="username">{user.username || user.name || 'Usuario'}</span>
              </div>
            )}
            <button className="nav-item logout-btn" onClick={handleLogout}>
              <LogOut size={20} />
              <span>LOGOUT</span>
            </button>
          </div>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
