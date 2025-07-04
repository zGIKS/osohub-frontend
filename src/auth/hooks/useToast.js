import { useCallback } from 'react';

export const useToast = () => {
  const showToast = useCallback((message, type = 'info', duration = 4000) => {
    if (window.showToast) {
      return window.showToast(message, type, duration);
    } else {
      console.warn('ToastContainer not found. Make sure it\'s included in your app.');
      // Fallback to console for development
      console.log(`Toast [${type}]: ${message}`);
    }
  }, []);

  const success = useCallback((message, duration = 4000) => {
    return showToast(message, 'success', duration);
  }, [showToast]);

  const error = useCallback((message, duration = 6000) => {
    // Los errores duran más tiempo para que se puedan leer
    return showToast(message, 'error', duration);
  }, [showToast]);

  const info = useCallback((message, duration = 4000) => {
    return showToast(message, 'info', duration);
  }, [showToast]);

  return {
    showToast,
    success,
    error,
    info
  };
};

export default useToast;
