import { API_URL } from '../constants/apiConstante';

/**
 * Utilitaire interne pour rafraîchir le token JWT via le refresh_token
 */
async function performTokenRefresh() {
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
    }
  }

  return response;
}
