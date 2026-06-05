import React from 'react';
import NotificationItem from './NotificationItem';

const NotificationList = ({ notifications, onMarkAsRead, onClosePanel }) => {
  if (notifications.length === 0) {
    return (
      <div className="p-8 text-center text-gray-400 flex flex-col items-center justify-center">
        <svg className="w-12 h-12 mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
        <p>Aucune notification</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col max-h-96 overflow-y-auto">
      {notifications.map((notif) => (
        <NotificationItem 
          key={notif.id} 
          notification={notif} 
          onMarkAsRead={onMarkAsRead}
          onClosePanel={onClosePanel}
        />
      ))}
    </div>
  );
};

export default NotificationList;
