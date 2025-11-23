import React from 'react';
import { useAppContext } from '../../context/AppContext';
import NotificationToast from '../NotificationToast/NotificationToast';
import './NotificationContainer.css';

const NotificationContainer = () => {
  const { notifications, removeNotification } = useAppContext();

  return (
    <div className="notification-container">
      {notifications.map((notification) => (
        <NotificationToast
          key={notification.id}
          message={notification.message}
          type={notification.type}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
};

export default NotificationContainer;
