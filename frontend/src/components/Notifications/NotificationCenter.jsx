import { useState, useRef, useEffect } from 'react';
import { useNotifications } from '../../hooks/useNotifications';
import NotificationList from './NotificationList';
import { Bell } from 'lucide-react';

const NotificationCenter = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => setIsOpen(!isOpen);

  // Fermer le dropdown quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bouton Cloche */}
      <button 
        onClick={toggleDropdown}
        className="relative p-2 text-gray-300 hover:text-white focus:outline-none transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 inline-flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-red-500 rounded-full border-2 border-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panneau de Notifications */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#252525] rounded-lg shadow-2xl border border-gray-700 z-50 overflow-hidden transform origin-top-right transition-all">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700 bg-[#1A1A1A]">
            <h3 className="text-sm font-semibold text-white">Notifications</h3>
            {unreadCount > 0 && (
              <div className="flex items-center gap-3">
                <span className="text-xs text-blue-400 font-medium">{unreadCount} non lue(s)</span>
                <button 
                  onClick={markAllAsRead} 
                  className="text-xs text-gray-400 hover:text-white transition-colors underline"
                >
                  Tout lu
                </button>
              </div>
            )}
          </div>
          
          <div className="bg-[#252525]">
            <NotificationList 
              notifications={notifications} 
              onMarkAsRead={markAsRead} 
              onClosePanel={() => setIsOpen(false)}
            />
          </div>
          
          {notifications.length > 0 && (
            <div className="border-t border-gray-700 bg-[#1A1A1A]">
              <button 
                className="w-full block py-3 text-xs font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Fermer
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
