import { useState, useEffect, useCallback } from 'react';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import { useAuth } from './useAuth';

export const useNotifications = () => {
  const { userId, isAdmin } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const res = await fetch('/api/notifications', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/ld+json'
        }
      });
      const data = await res.json();
      const items = data['hydra:member'] || data.member || data;
      if (Array.isArray(items)) {
        setNotifications(items);
        setUnreadCount(items.filter(n => !n.isRead).length);
      }
    } catch (e) {
      console.error('Error fetching notifications', e);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();

    if (!userId) return;

    const token = localStorage.getItem('token');
    const topic = `https://2round.com/users/${userId}/notifications`;
    const url = new URL('http://127.0.0.1:8080/.well-known/mercure');
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
  }, [userId, fetchNotifications]);

  const markAsRead = async (id) => {
    const token = localStorage.getItem('token');
    try {
      await fetch(`/api/notifications/${id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/merge-patch+json',
          'Accept': 'application/ld+json'
        },
        body: JSON.stringify({ isRead: true })
      });
      
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (e) {
      console.error('Error marking as read', e);
    }
  };

  return { notifications, unreadCount, markAsRead };
};
