import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Grid3x3, 
  User, 
  Settings,
  Menu,
  X
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navigationItems = [
    { icon: Grid3x3, label: 'FEED', path: '/', id: 'feed' },
    { icon: User, label: 'PROFILE', path: '/profile', id: 'profile' },
    { icon: Settings, label: 'SETTINGS', path: '/settings', id: 'settings' },
  ];

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
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
