// Configuración centralizada de la aplicación
const config = {
  // API Configuration
  api: {
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
    timeout: parseInt(import.meta.env.VITE_API_TIMEOUT) || 10000,
  },
  
  // Authentication - claves fijas para localStorage
  auth: {
    tokenKey: 'authToken',
    userIdKey: 'currentUserId',
    usernameKey: 'username',
  },
  
  // App Configuration
  app: {
    name: import.meta.env.VITE_APP_NAME || 'OSOHUB',
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
  },
  
  // Development flags
  dev: {
    enableMockData: import.meta.env.VITE_ENABLE_MOCK_DATA === 'true',
    debugAPI: true, // Force debug for now to diagnose likes issue
  },
  
  // Endpoints structure
  endpoints: {
    // Autenticación
    LOGIN: '/auth/login',
    
    // Usuarios
    GET_USER: '/users/:user_id',
    GET_CURRENT_USER: '/users/me',
    CREATE_USER: '/users',
    UPDATE_PROFILE: '/users/me',
    BAN_USER: '/users/:user_id/ban',
    GET_PUBLIC_PROFILE: '/profile/:username',
    GET_SHARE_LINK: '/users/me/share-link',
    
    // Imágenes
    GET_FEED: '/feed', // Supports ?day_bucket=YYYY-MM-DD or no params for all images
    UPLOAD_IMAGE: '/images',
    GET_IMAGE: '/images/byid/:image_id',
    GET_USER_IMAGES: '/users/:user_id/images',
    DELETE_IMAGE: '/images/:image_id',
    
    // Likes
    LIKE_IMAGE: '/images/:image_id/like',
    UNLIKE_IMAGE: '/images/:image_id/like',
    GET_LIKES_COUNT: '/images/:image_id/likes/count',
    CHECK_IF_LIKED: '/images/:image_id/like/status',
    
    // Reports
    REPORT_IMAGE: '/images/:image_id/report',
    GET_REPORTS_COUNT: '/images/:image_id/reports/count',
    GET_REPORT_CATEGORIES: '/reports/categories',
    GET_REPORTS_BY_CATEGORY: '/reports/by-category',
  }
};

// Helper function para logging en desarrollo
export const debugLog = (message, data = null) => {
  if (config.dev.debugAPI) {
    console.log(`[${config.app.name}] ${message}`, data || '');
  }
};

// Helper function para obtener token
export const getAuthToken = () => {
  return localStorage.getItem(config.auth.tokenKey);
};

// Helper function para obtener user ID
export const getCurrentUserId = () => {
  return localStorage.getItem(config.auth.userIdKey);
};

// Helper function para obtener username
export const getCurrentUsername = () => {
  return localStorage.getItem(config.auth.usernameKey);
};

// Helper function para guardar auth data
export const setAuthData = (token, userId, username = null) => {
  localStorage.setItem(config.auth.tokenKey, token);
  localStorage.setItem(config.auth.userIdKey, userId);
  if (username) {
    localStorage.setItem(config.auth.usernameKey, username);
  }
};

// Helper function para limpiar auth data
export const clearAuthData = () => {
  localStorage.removeItem(config.auth.tokenKey);
  localStorage.removeItem(config.auth.userIdKey);
  localStorage.removeItem(config.auth.usernameKey);
};

export default config;
