import { useState, useEffect, useCallback } from 'react';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import { useAuth } from './useAuth';
import { securedFetch } from '../utils/api';

export const useNotifications = () => {
  const { userId, isAdmin } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await securedFetch('/api/notifications', {
        headers: {
          'Accept': 'application/ld+json'
        }
      });
      
      if (!res || !res.ok) return;
      const data = await res.json();
      const items = data['hydra:member'] || data.member || data;
      if (Array.isArray(items)) {
        setNotifications(items);
        setUnreadCount(items.filter(n => {
          const val = n.isRead !== undefined ? n.isRead : (n.read !== undefined ? n.read : n.is_read);
          const isRead = val === true || val === 1 || val === '1' || val === 'true' || val === 'TRUE' || val === '1.0';
          return !isRead;
        }).length);
      }
    } catch (e) {
      console.error('Error fetching notifications', e);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchNotifications();

    if (!userId) return;

    const topic = `https://2round.com/users/${userId}/notifications`;
    const url = new URL('/.well-known/mercure', window.location.origin);
    url.searchParams.append('topic', topic);
    
    // Si l'utilisateur est admin, il écoute aussi le topic global admin
    if (isAdmin) {
      url.searchParams.append('topic', 'https://2round.com/admin/notifications');
    }

    const controller = new AbortController();

    fetchEventSource(url.toString(), {
      method: 'GET',
      signal: controller.signal,
      onmessage(ev) {
        if (ev.data) {
          const newNotification = JSON.parse(ev.data);
          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(prev => prev + 1);
        }
      },
      onerror(err) {
        console.error('Mercure SSE error', err);
      }
    });

    return () => {
      controller.abort();
    };
  }, [userId, isAdmin, fetchNotifications]);

  const markAsRead = async (id) => {
    try {
      await securedFetch(`/api/notifications/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/merge-patch+json'
        },
        body: JSON.stringify({ isRead: true })
      });
      
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (e) {
      console.error('Error marking as read', e);
    }
  };

  const markAllAsRead = async () => {
    const unreadNotifs = notifications.filter(n => {
      const val = n.isRead !== undefined ? n.isRead : (n.read !== undefined ? n.read : n.is_read);
      const isRead = val === true || val === 1 || val === '1' || val === 'true' || val === 'TRUE' || val === '1.0';
      return !isRead;
    });

    if (unreadNotifs.length === 0) return;

    // Mettre à jour l'état local immédiatement (Optimistic UI)
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);

    try {
      await Promise.all(unreadNotifs.map(n => 
        securedFetch(`/api/notifications/${n.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/merge-patch+json'
          },
          body: JSON.stringify({ isRead: true })
        })
      ));
    } catch (e) {
      console.error('Error marking all as read', e);
      fetchNotifications(); // Rollback en cas d'erreur
    }
  };

  return { notifications, unreadCount, markAsRead, markAllAsRead };
};
