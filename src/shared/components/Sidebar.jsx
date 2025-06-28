import { Link, useLocation } from 'react-router-dom';
import { 
  Grid3x3, 
  User, 
  Settings
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
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

  return (
    <div className="sidebar">
      {/* Logo */}
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
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Auth Buttons */}
      <div className="sidebar-auth">
        <Link to="/signup" className="auth-btn primary">
          SIGN UP
        </Link>
        <Link to="/login" className="auth-btn secondary">
          LOG IN
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;
