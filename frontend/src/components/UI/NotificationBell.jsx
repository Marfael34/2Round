import { useState, useEffect, useRef } from 'react';
import { FiBell } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { securedFetch } from '../../utils/api';
import { API_URL } from '../../constants/apiConstante';

const NotificationBell = ({ isMobile = false, userId }) => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      const response = await securedFetch(`${API_URL}/notifications?order[createdAt]=desc&_t=${Date.now()}`);
      if (response.ok) {
        const data = await response.json();
        const items = data['hydra:member'] || [];
        setNotifications(items);
        setUnreadCount(items.filter((n) => !n.isRead).length);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    
    // MERCURE: Configuration de l'URL du hub vers le conteneur Docker sur le port 8080
    const url = new URL('http://localhost:8080/.well-known/mercure');
    // Vite utilise un proxy vers localhost:8090 et change l'origin. 
    // Symfony génère donc le topic avec localhost:8090 !
    const absoluteTopic = `http://localhost:8090${API_URL}/notifications/{id}`;
    url.searchParams.append('topic', absoluteTopic);
    
    const eventSource = new EventSource(url, { withCredentials: true });

    eventSource.onmessage = (event) => {
      const newNotification = JSON.parse(event.data);
      
      // Filtrer les notifications pour ne garder que celles de l'utilisateur courant
      if (userId && newNotification.user !== `/api/users/${userId}`) {
        return;
      }
      
      setNotifications(prev => {
        if (prev.find(n => n.id === newNotification.id)) return prev;
        return [newNotification, ...prev];
      });
      setUnreadCount(prev => prev + 1);
    };
    
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      eventSource.close();
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [userId]);

  const markAsRead = async (notification) => {
    if (notification.isRead) return;

    try {
      await securedFetch(`${API_URL}/notifications/${notification.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/merge-patch+json',
        },
        body: JSON.stringify({ isRead: true }),
      });
      
      setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read', error);
    }
  };

  const handleNotificationClick = (notification) => {
    markAsRead(notification);
    setIsOpen(false);

    switch (notification.type) {
      case 'message':
        navigate('/conversation');
        break;
      case 'offer':
      case 'purchase':
        navigate('/my-locker');
        break;
      case 'sanction':
        navigate('/wallet');
        break;
      case 'report':
      case 'product_modified_after_report':
        navigate('/admin/dashboard');
        break;
      default:
        break;
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className={`relative ${isMobile ? 'w-full' : ''}`} ref={dropdownRef}>
      <div 
        className="cursor-pointer hover:text-gray-300 transition-colors relative flex items-center w-full"
        onClick={() => setIsOpen(!isOpen)}
      >
        <FiBell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -left-1 md:-right-1 bg-red-500 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
        {isMobile && <span className="text-sm font-medium pl-3">Notifications</span>}
      </div>

      {isOpen && (
        <div className={`${isMobile ? 'static w-full mt-2' : 'absolute right-0 mt-2 w-80'} bg-[#1A1A1A] border border-gray-700 rounded-lg shadow-xl py-2 z-50`}>
          <div className="px-4 py-2 border-b border-gray-700">
            <h3 className="text-sm font-bold text-white">Notifications</h3>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-gray-500">
                Aucune notification pour le moment
              </div>
            ) : (
              notifications.map((notification) => (
                <div 
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`px-4 py-3 border-b border-gray-800 cursor-pointer hover:bg-gray-800 transition-colors ${!notification.isRead ? 'bg-gray-900/50' : ''}`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs font-semibold uppercase text-red-500">
                      {notification.type}
                    </span>
                    <span className="text-[10px] text-gray-500">
                      {formatTime(notification.createdAt)}
                    </span>
                  </div>
                  <p className={`text-sm ${!notification.isRead ? 'text-white font-medium' : 'text-gray-400'}`}>
                    {notification.content}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;

