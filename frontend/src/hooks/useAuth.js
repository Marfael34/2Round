import { useState, useEffect } from 'react';

export const useAuth = () => {
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
          window.atob(base64)
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
        const payload = JSON.parse(jsonPayload);
        // On vérifie si l'id est directement dans le token (selon config LexikJWT)
        if (payload.id) {
            setUserId(payload.id);
        } else if (payload.username) {
            // Si pas d'ID, on pourrait faire un fetch, mais idéalement il faut modifier LexikJWT pour inclure l'ID.
            // Pour le moment on le stocke dans le localStorage après la connexion ? 
            // Vérifions s'il y a un user_id dans le localStorage
            const storedUserId = localStorage.getItem('user_id');
            if (storedUserId) {
                setUserId(storedUserId);
            }
        }
      } catch (e) {
        console.error('Invalid token', e);
      }
    }
  }, []);

  return { userId };
};
