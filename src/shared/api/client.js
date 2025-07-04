import axios from 'axios';
import config, { debugLog, getAuthToken, clearAuthData } from '../../config';

const apiClient = axios.create({
  baseURL: config.api.baseURL,
  timeout: config.api.timeout,
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Interceptor para agregar el token de autenticación
apiClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Si es FormData, no establecer Content-Type (axios lo hará automáticamente)
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    debugLog(`API Request: ${config.method?.toUpperCase()} ${config.url}`, {
      headers: config.headers,
      data: config.data instanceof FormData ? 'FormData' : config.data
    });
    
    return config;
  },
  (error) => {
    debugLog('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas
apiClient.interceptors.response.use(
  (response) => {
    debugLog(`API Response: ${response.status} ${response.config.url}`, {
      data: response.data,
      status: response.status
    });
    return response;
  },
  (error) => {
    debugLog('API Response Error:', {
      status: error.response?.status,
      message: error.message,
      url: error.config?.url
    });
    
    if (error.response?.status === 401) {
      clearAuthData();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Función helper para hacer peticiones con fetch (alternativa)
const apiRequest = async (endpoint, options = {}) => {
  const url = `${config.api.baseURL}${endpoint}`;
  const token = getAuthToken();
  
  const requestConfig = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
    ...options,
  };

  debugLog(`Fetch Request: ${options.method || 'GET'} ${url}`, requestConfig);

  try {
    const response = await fetch(url, requestConfig);
    const data = await response.json();
    
    debugLog(`Fetch Response: ${response.status} ${url}`, data);
    
    if (!response.ok && response.status === 401) {
      clearAuthData();
      window.location.href = '/login';
    }
    
    return data;
  } catch (error) {
    debugLog('Fetch Error:', error);
    throw error;
  }
};

export default apiClient;
export { apiRequest };
export { config };
