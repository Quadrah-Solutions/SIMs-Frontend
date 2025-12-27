import React, { createContext, useState, useContext, useCallback } from 'react';
import Notification from '../Notification';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const showNotification = useCallback(({ type = 'info', message, duration = 5000 }) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, type, message, duration }]);
    
    // Auto-remove after duration
    setTimeout(() => {
      setNotifications(prev => prev.filter(notification => notification.id !== id));
    }, duration);
    
    return id;
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const success = useCallback((message, duration = 5000) => {
    return showNotification({ type: 'success', message, duration });
  }, [showNotification]);

  const error = useCallback((message, duration = 5000) => {
    return showNotification({ type: 'error', message, duration });
  }, [showNotification]);

  const warning = useCallback((message, duration = 5000) => {
    return showNotification({ type: 'warning', message, duration });
  }, [showNotification]);

  const info = useCallback((message, duration = 5000) => {
    return showNotification({ type: 'info', message, duration });
  }, [showNotification]);

  return (
    <NotificationContext.Provider value={{ 
      showNotification, 
      removeNotification, 
      clearAll,
      success,
      error,
      warning,
      info
    }}>
      {children}
      <div className="fixed top-0 right-0 z-[9999] p-6 space-y-4">
        {notifications.map(notification => (
          <Notification
            key={notification.id}
            type={notification.type}
            message={notification.message}
            duration={notification.duration}
            onClose={() => removeNotification(notification.id)}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  );
};