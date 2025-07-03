import React, { useState, useCallback } from 'react';
import Toast from './Toast';
import './ToastContainer.css';

const ToastContainer = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    // Prevenir duplicados exactos
    const isDuplicate = toasts.some(toast => 
      toast.message === message && toast.type === type
    );
    
    if (isDuplicate) {
      return; // No agregar toast duplicado
    }

    // Prevenir errores similares de biografía
    if (type === 'error' && message.includes('Biography')) {
      const hasBioError = toasts.some(toast => 
        toast.type === 'error' && toast.message.includes('Biography')
      );
      
      if (hasBioError) {
        return; // No agregar otro error de biografía si ya hay uno
      }
    }

    // Prevenir errores similares de palabras
    if (type === 'error' && message.includes('Words cannot exceed')) {
      const hasWordError = toasts.some(toast => 
        toast.type === 'error' && toast.message.includes('Words cannot exceed')
      );
      
      if (hasWordError) {
        return; // No agregar otro error de palabras si ya hay uno
      }
    }

    const id = Date.now() + Math.random();
    const newToast = {
      id,
      message,
      type,
      duration
    };

    setToasts(prev => {
      // Limitar a máximo 5 toasts simultáneos
      const updatedToasts = [...prev, newToast];
      if (updatedToasts.length > 5) {
        // Remover el toast más antiguo
        return updatedToasts.slice(1);
      }
      return updatedToasts;
    });

    return id;
  }, [toasts]);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  // Expose functions globally
  React.useEffect(() => {
    window.showToast = addToast;
    return () => {
      delete window.showToast;
    };
  }, [addToast]);

  return (
    <div className="toast-container">
      {toasts.map((toast, index) => (
        <div 
          key={toast.id}
          className="toast-wrapper"
          style={{
            '--toast-index': index,
            zIndex: 9999 - index
          }}
        >
          <Toast
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={() => removeToast(toast.id)}
          />
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
