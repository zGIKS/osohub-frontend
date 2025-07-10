import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false); // Default to light mode

  // Load theme preference from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
    } else {
      // Default to light mode
      setIsDarkMode(false);
    }
  }, []);

  // Apply theme to document root
  useEffect(() => {
    const root = document.documentElement;
    
    if (isDarkMode) {
      // Dark theme colors
      root.style.setProperty('--bg-primary', '#000000');
      root.style.setProperty('--bg-secondary', '#111111');
      root.style.setProperty('--bg-tertiary', '#1a1a1a');
      root.style.setProperty('--text-primary', '#ffffff');
      root.style.setProperty('--text-secondary', '#a1a1a1');
      root.style.setProperty('--text-muted', '#6b7280');
      root.style.setProperty('--border-color', '#333333');
      root.style.setProperty('--accent-color', '#ffffff');
      root.style.setProperty('--hover-bg', '#1f1f1f');
      root.style.setProperty('--sidebar-bg', '#000000');
      root.style.setProperty('--card-bg', '#111111');
      root.style.setProperty('--overlay-bg', 'rgba(0, 0, 0, 0.9)');
    } else {
      // Light theme colors
      root.style.setProperty('--bg-primary', '#ffffff');
      root.style.setProperty('--bg-secondary', '#f8f9fa');
      root.style.setProperty('--bg-tertiary', '#e9ecef');
      root.style.setProperty('--text-primary', '#000000');
      root.style.setProperty('--text-secondary', '#6c757d');
      root.style.setProperty('--text-muted', '#9ca3af');
      root.style.setProperty('--border-color', '#dee2e6');
      root.style.setProperty('--accent-color', '#000000');
      root.style.setProperty('--hover-bg', '#f8f9fa');
      root.style.setProperty('--sidebar-bg', '#ffffff');
      root.style.setProperty('--card-bg', '#ffffff');
      root.style.setProperty('--overlay-bg', 'rgba(0, 0, 0, 0.85)');
    }

    // Save theme preference
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
