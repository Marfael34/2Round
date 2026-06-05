import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotificationItem = ({ notification, onMarkAsRead, onClosePanel }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (!notification.isRead) {
      onMarkAsRead(notification.id);
    }
    if (notification.link) {
      navigate(notification.link);
      if (onClosePanel) onClosePanel();
    }
  };

  const date = new Date(notification.createdAt);
  const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div 
      onClick={handleClick}
      className={`p-4 border-b border-gray-700 cursor-pointer transition-colors duration-200 hover:bg-[#333] flex flex-col gap-1 ${!notification.isRead ? 'bg-[#2A2A2A]' : 'bg-[#252525]'}`}
    >
      <div className="flex justify-between items-start">
        <h4 className={`text-sm font-medium ${!notification.isRead ? 'text-white' : 'text-gray-300'}`}>
          {notification.title}
        </h4>
        {!notification.isRead && (
          <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1"></span>
        )}
      </div>
      <p className="text-sm text-gray-400 line-clamp-2">{notification.message}</p>
      <span className="text-xs text-gray-500 mt-1">{formattedDate}</span>
    </div>
  );
};

export default NotificationItem;
