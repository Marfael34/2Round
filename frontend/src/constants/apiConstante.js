//======================
// CONSTANTES DE L'API
//======================
// ce fichier centralisent toutes les URL de l'API Symfony 
// l'avantage: Modifier l'URL de base en un seul endroit 

// URL racine du serveur backend
// En utilisant une chaîne vide, les requêtes deviennent relatives au domaine actuel (ex: le tunnel Cloudflare)
// Vite se chargera de les rediriger (proxy) vers le backend local.
export const API_ROOT = '';

// l'URL de base pour l'API Plateform 
export const API_URL = `${API_ROOT}/api`;

// ==============================
// URLS DES RESSOURCES STATIQUES
// ==============================

// Image générales  (logo, ect)
export const IMAGE_URL = `${API_ROOT}/images`;

// Avatars des utilisateur 
export const AVATAR_URL = `${API_ROOT}/uploads`;