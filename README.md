<div align="center">
  <img src="frontend/src/assets/logo.png" alt="2Round Logo" width="150"/>
  <h1>2Round</h1>
  <p><strong>La Marketplace Nouvelle Génération pour les Sports de Combat</strong></p>

  [![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
  [![Symfony](https://img.shields.io/badge/Symfony-000000?style=for-the-badge&logo=symfony&logoColor=white)](https://symfony.com/)
  [![API Platform](https://img.shields.io/badge/API_Platform-38A2E5?style=for-the-badge&logo=v&logoColor=white)](https://api-platform.com/)
  [![Docker](https://img.shields.io/badge/Docker-2CA5E0?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
  [![Stripe](https://img.shields.io/badge/Stripe-626CD9?style=for-the-badge&logo=Stripe&logoColor=white)](https://stripe.com/)
</div>

<br />

## 📋 1. Présentation du projet

**2Round** est une plateforme C2C (Consumer-to-Consumer) spécialisée dans l'achat et la vente d'équipements et de vêtements liés aux sports de combat (boxe, MMA, lutte, etc.). 

**Problématique résolue :**
Les pratiquants de sports de combat manquent d'une plateforme d'échange dédiée. Les marketplaces généralistes sont saturées et ne permettent pas de cibler facilement des équipements très spécifiques, souvent coûteux neufs. 2Round centralise l'offre et la demande tout en garantissant des transactions financières sécurisées et des envois tracés.

**Fonctionnalités principales :**
- 🛍️ **Marketplace C2C** : Achat et vente de produits d'occasion ou neufs.
- 💬 **Messagerie en temps réel** : Chat intégré entre acheteurs et vendeurs.
- 🤝 **Négociation** : Système intégré d'offres et de contre-offres.
- 💳 **Paiement Sécurisé & Wallet** : Séquestration des fonds et gestion de porte-monnaie virtuel via Stripe.
- 📦 **Logistique** : Génération automatisée d'étiquettes d'expédition via Mondial Relay.
- 🔔 **Notifications Push** : Système d'alertes en temps réel (Mercure Hub).
- 🛡️ **Modération avancée** : Dashboard administrateur avec système de signalement, litiges, avertissements et bannissements automatiques.

---

## 👁️ 2. Aperçu

*Une plateforme pensée pour la performance, l'expérience utilisateur et la sécurité.*

### Parcours Utilisateur
- **Mon Vestiaire** : Gestion des articles en vente, des transactions en cours et de l'historique.
- **Le Round Personnalisé** : Flux de produits suggérés selon les mensurations, le style de boxe et le niveau de l'utilisateur.
- **Porte-monnaie (Wallet)** : Historique des transactions et récupération des fonds.

> 📸 *[Insérer ici un GIF ou une capture d'écran du Dashboard / Page d'accueil]*

---

## 🛠️ 3. Technologies utilisées

### 💻 Frontend
- **React.js** (via **Vite**) : Rendu d'interface dynamique.
- **Tailwind CSS** : Intégration UI/UX moderne, mode sombre et design responsif.
- **React Router DOM** : Gestion des routes frontend.
- **SSE (Server-Sent Events)** : `@microsoft/fetch-event-source` pour la consommation du flux temps réel.

### ⚙️ Backend
- **Symfony 6/7** : Base robuste de l'application.
- **API Platform** : Génération des endpoints RESTful et de la documentation OpenAPI/Swagger.
- **Doctrine ORM** : Gestion de la base de données.
- **Mercure Hub** : WebSockets/SSE pour la messagerie et les notifications push.
- **LexikJWTAuthenticationBundle** : Sécurisation par token JWT.

### 🗄️ Base de données & Infra
- **MySQL / MariaDB** (via conteneur Docker).
- **Docker & Docker Compose** : Environnement de développement isolé et reproductible.

### 🔌 Services Tiers
- **Stripe** : Paiements, prélèvements, et portefeuilles virtuels (Connect).
- **Mondial Relay** : Simulation et création des étiquettes de livraison.

---

## 🚀 4. Installation

Suivez ces étapes pour configurer et lancer le projet localement.

### Prérequis
- [Docker Desktop](https://www.docker.com/products/docker-desktop) ou Docker Engine & Compose installés.
- [Node.js](https://nodejs.org/) (v18+) et npm.
- [PHP](https://www.php.net/) & [Composer](https://getcomposer.org/) (optionnel, utile en local).

### 1. Clonage du dépôt
```bash
git clone git@github.com:Marfael34/2Round.git
cd 2Round
```

### 2. Configuration et Lancement du Backend
Le backend repose entièrement sur Docker.

```bash
cd backend
# Démarrer les conteneurs en tâche de fond
docker compose up -d

# Accéder au conteneur web/php
docker compose exec -it apache_secondround bash
```

*Une fois à l'intérieur du conteneur `apache_secondround` :*
```bash
# Installer les dépendances PHP
composer install

# Créer la base de données et appliquer les migrations
php bin/console doctrine:database:create --if-not-exists
php bin/console doctrine:migrations:migrate -n

# Générer les clés JWT pour l'authentification
php bin/console lexik:jwt:generate-keypair

# (Optionnel) Vider le cache
php bin/console cache:clear
```
> **Variables d'environnement** : Vérifiez et configurez le fichier `backend/www/.env` ou `backend/www/.env.local` pour les clés API (Stripe, Mercure, etc.).

### 3. Configuration et Lancement du Frontend
```bash
# Ouvrir un nouveau terminal
cd frontend

# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm run dev
```
> 💡 **Test sur mobile** : Le script `npm run dev` intègre un tunnel **Cloudflared**. L'URL `https://xxx.trycloudflare.com` générée permet d'accéder au frontend sur votre smartphone en 4G. Un proxy Vite est configuré pour faire transiter les appels Mercure à travers le tunnel.

---

## 💡 5. Utilisation

1. **Inscription / Connexion** : Créez un compte via `/register`. Renseignez vos mensurations et vos préférences de combat.
2. **Ajout d'un article** : Cliquez sur "Vendre", téléversez une image, fixez un prix et un état.
3. **Recherche et Négociation** : Parcourez le catalogue. Utilisez le bouton "Négocier" pour ouvrir une conversation en temps réel.
4. **Validation et Paiement** : Payez en toute sécurité via la modale Stripe. Les fonds sont gelés jusqu'à réception de l'article.
5. **Modération** : (Si rôle `ROLE_ADMIN`) Accédez au `/admin/dashboard` pour surveiller les signalements et bannir les utilisateurs frauduleux.

---

## 📡 6. API & Endpoints

L'application expose une API REST riche documentée via API Platform.  
📍 **Swagger UI** disponible sur : `http://localhost:8090/api/docs`

### Exemples d'Endpoints
| Méthode | Endpoint | Description | Sécurité |
|---------|----------|-------------|----------|
| `POST` | `/api/login_check` | Authentification et obtention du JWT | Public |
| `GET` | `/api/products` | Récupération du catalogue de produits | Public |
| `POST` | `/api/messages` | Envoi d'un message dans une conversation | JWT Requis |
| `PATCH`| `/api/offers/{id}` | Accepter / Refuser une offre | JWT Requis |
| `POST` | `/api/reports` | Soumettre un signalement (produit/user) | JWT Requis |

---

## 🏗️ 7. Architecture du projet

### Organisation des dossiers
```text
2Round/
├── backend/
│   ├── docker-compose.yml       # Définition des services (Apache, MySQL, Mercure)
│   └── www/                     # Code source Symfony 
│       ├── src/
│       │   ├── Controller/      # Contrôleurs spécifiques (Stripe, Factures PDF)
│       │   ├── Entity/          # Entités Doctrine & Annotations API Platform
│       │   ├── EventSubscriber/ # Écouteurs d'événements (création automatique de notifications)
│       │   └── Security/        # UserChecker (blocage des bans temporaires)
│       └── config/              # Configuration Symfony & API Platform
└── frontend/
    ├── src/
    │   ├── components/          # Composants UI réutilisables (NavBar, Modals)
    │   ├── screens/             # Pages complètes (Conversation, Marketplace, Admin)
    │   ├── hooks/               # Custom hooks React (ex: useNotifications)
    │   └── utils/               # Helpers (Fetch interceptors pour le JWT)
    ├── index.html               # Point d'entrée
    └── vite.config.js           # Configuration Vite et proxy API/Mercure
```

### Flux de données temps réel (Mercure)
1. Le Frontend maintient une connexion SSE (`EventSource`) vers l'URL `/mercure`.
2. Lors de l'envoi d'un message (POST `/api/messages`), le serveur Symfony met à jour la base de données.
3. Symfony interroge le `Mercure Hub` qui diffuse instantanément l'événement au Frontend cible.

---

## 🔒 8. Sécurité

- **JWT Authentication** : Les tokens ont une durée de vie courte. Interception automatique sur le frontend pour déconnecter l'utilisateur à expiration.
- **UserChecker Symfony** : Intercepte les connexions pour empêcher la connexion des utilisateurs avec un bannissement temporaire ou définitif.
- **Isolations API Platform** : Extensions de requêtes (`QueryExtension`) pour s'assurer qu'un utilisateur ne récupère que *ses* conversations, *ses* factures et *ses* notifications. Les administrateurs contournent ces règles.
- **Sécurité des Transactions** : Le paiement par carte bleue n'est jamais stocké sur le serveur, tout passe de manière asynchrone par l'API Stripe.

---

## 🚀 9. Déploiement

*Section à adapter selon l'hébergeur (AWS, VPS classique, Heroku, etc.).*

1. **Serveur** : VPS Linux (Ubuntu/Debian) avec Docker installé.
2. **Reverse Proxy** : Nginx ou Traefik pour gérer le SSL/TLS (HTTPS) et rediriger le port 80/443 vers les conteneurs internes.
3. **Variables Prod** : 
   - `APP_ENV=prod`
   - `CORS_ALLOW_ORIGIN=https://www.2round.fr`
   - Générer de nouvelles clés JWT de production.
4. **Build Frontend** : 
   ```bash
   npm run build
   ```
   *Servir le dossier `dist/` généré.*

---

## 🔭 10. Améliorations futures

- [ ] **Webhooks Stripe** : Gérer les paiements asynchrones et échecs de paiement via des webhooks sécurisés.
- [ ] **Intégration API Mondial Relay** : Remplacer la simulation actuelle par les vrais webservices Mondial Relay (SOAP/REST).
- [ ] **Système d'avis détaillés** : Permettre d'inclure des photos dans les évaluations post-achat.
- [ ] **Optimisation SEO** : Rendu côté serveur (SSR) via Next.js ou React Router SSR si le besoin d'indexation du catalogue devient critique.

---

## 👨‍💻 11. Auteur

- **Raphael Martinez (Marfael34)**
- Projet de fin d'année académique.
- GitHub : [@Marfael34](https://github.com/Marfael34)

---
*Ce fichier a été généré pour fournir une documentation technique complète et claire du projet 2Round.*

<details>
<summary><b>✏️ Informations à compléter (To-Do interne)</b></summary>
<br>

1. **Images/Gifs** : Penser à ajouter des captures d'écran de l'application dans la section "Aperçu".
2. **Variables d'environnement** : Documenter la structure exacte du fichier `.env` nécessaire pour Stripe et Mercure si le projet est open-sourcé.
3. **Déploiement** : Préciser le nom de domaine final et la configuration Nginx si déployé sur un VPS.
</details>
