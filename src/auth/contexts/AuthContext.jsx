import { createContext, useContext, useState, useEffect } from 'react';
import { getAuthToken, getCurrentUserId, clearAuthData } from '../../config';
import { userService } from '../services/userService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    const token = getAuthToken();
    const userId = getCurrentUserId();

    if (token && userId) {
      try {
        // Intentar recuperar datos del usuario del localStorage
        const savedUserData = localStorage.getItem('userData');
        if (savedUserData) {
          const userData = JSON.parse(savedUserData);
          setUser(userData);
          setIsAuthenticated(true);
        } else {
          // Si no hay datos guardados, cargarlos desde la API
          await loadUserData();
        }
      } catch (error) {
        console.error('Error parsing saved user data:', error);
        // Si hay error al parsear, limpiar y cargar desde API
        localStorage.removeItem('userData');
        await loadUserData();
      }
    } else {
      setUser(null);
      setIsAuthenticated(false);
    }
    setLoading(false);
  };

  const loadUserData = async () => {
    try {
      const userData = await userService.getCurrentUser();
      setUser(userData);
      setIsAuthenticated(true);
      // Guardar en localStorage para próximas visitas
      localStorage.setItem('userData', JSON.stringify(userData));
    } catch (error) {
      console.error('Error loading user data:', error);
      // Si falla cargar datos pero tenemos token, mantener autenticado sin datos de usuario
      setIsAuthenticated(true);
      setUser(null);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await userService.login(email, password);
      
      if (response.token && response.user && response.user.user_id) {
        const token = response.token;
        const userId = response.user.user_id;
        
        localStorage.setItem('authToken', token);
        localStorage.setItem('currentUserId', userId);
        localStorage.setItem('userData', JSON.stringify(response.user));
        
        // Usar los datos del usuario que ya vienen en la respuesta
        setUser(response.user);
        setIsAuthenticated(true);
        
        return { success: true };
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed. Please check your credentials.' 
      };
    }
  };

  const signup = async (userData) => {
    try {
      const response = await userService.createUser(userData);
      
      if (response.token && response.user && response.user.user_id) {
        const token = response.token;
        const userId = response.user.user_id;
        
        localStorage.setItem('authToken', token);
        localStorage.setItem('currentUserId', userId);
        localStorage.setItem('userData', JSON.stringify(response.user));
        
        // Usar los datos del usuario que ya vienen en la respuesta
        setUser(response.user);
        setIsAuthenticated(true);
        
        return { success: true };
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Signup error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to create account. Please try again.' 
      };
    }
  };

  const logout = () => {
    clearAuthData();
    localStorage.removeItem('userData');
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateUser = async (userData) => {
    try {
      const updatedUser = await userService.updateUser(userData);
      
      // Combinar datos existentes con los nuevos
      const mergedUser = { ...user, ...updatedUser };
      setUser(mergedUser);
      
      // Actualizar localStorage
      localStorage.setItem('userData', JSON.stringify(mergedUser));
      
      return { success: true, user: mergedUser };
    } catch (error) {
      console.error('Update user error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to update profile.' 
      };
    }
  };

  // Función para refrescar datos del usuario
  const refreshUser = async () => {
    await loadUserData();
    
    // Emitir evento personalizado cuando se actualice el usuario
    window.dispatchEvent(new CustomEvent('userProfileUpdated', { 
      detail: { user } 
    }));
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    signup,
    logout,
    updateUser,
    refreshUser,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
