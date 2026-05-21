import { API_URL } from '../constants/apiConstante';

let cachedUserId = null;
let lastDecodedToken = null;

export const getCurrentUserId = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    cachedUserId = null;
    lastDecodedToken = null;
    return null;
  }
  
  if (token === lastDecodedToken) {
    return cachedUserId;
  }

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
    // On espère que id sera dans le token maintenant avec JWTCreatedListener
    cachedUserId = payload.id ? Number(payload.id) : null;
    
    // Fallback: vérifier le localStorage direct
    if (!cachedUserId) {
        const stored = localStorage.getItem('user_id');
        if (stored) cachedUserId = Number(stored);
    }
    
    lastDecodedToken = token;
    return cachedUserId;
  } catch (e) {
    return null;
  }
};

/**
 * Utilitaire interne pour rafraîchir le token JWT via le refresh_token
 */
let isRefreshing = false;
let refreshPromise = null;

async function performTokenRefresh() {
  if (isRefreshing) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        throw new Error('Aucun refresh token disponible');
      }

      const response = await fetch(`${API_URL}/token/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (!response.ok) {
        throw new Error('Impossible de rafraîchir le token');
      }

      const data = await response.json();
      
      // Sauvegarde du nouveau jeu de tokens (rotation)
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      if (data.refresh_token) {
        localStorage.setItem('refresh_token', data.refresh_token);
      }

      return data.token;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}


/**
 * Wrapper intelligent autour de fetch qui gère automatiquement
 * l'injection du JWT et le renouvellement transparent via le refresh token.
 */
export async function securedFetch(url, options = {}) {
  let token = localStorage.getItem('token');
  
  if (token) {
    localStorage.setItem('lastActive', Date.now().toString());
  }
  
  // Fusionner les headers avec les valeurs par défaut
  const headers = {
    'Accept': 'application/ld+json, application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // 1. Exécuter la requête initiale
  let response = await fetch(url, { ...options, headers });

  // 2. Si le token est expiré (401 Unauthorized), tenter le rafraîchissement
  if (response.status === 401) {
    try {
      // Tenter d'obtenir un nouveau token d'accès
      const newToken = await performTokenRefresh();
      
      // Mettre à jour l'en-tête d'autorisation
      headers['Authorization'] = `Bearer ${newToken}`;
      
      // Rejouer la requête d'origine de manière transparente pour l'utilisateur
      response = await fetch(url, { ...options, headers });
    } catch {
      // Le refresh token a lui aussi expiré ou est invalide -> déconnexion et redirection
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
      
      // Rediriger vers la page login avec un message explicite
      window.location.href = '/login?expired=1';
      // Geler l'exécution pour laisser le navigateur rediriger sans faire crasher React
      return new Promise(() => {});
    }
  }

  return response;
}
