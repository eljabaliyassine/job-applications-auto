# ⚡ TechStore - Plateforme E-Commerce Fullstack Moderne (v2.0)

Plateforme marchande High-Tech complète et professionnelle développée avec **React 18** (Vite), **Tailwind CSS v4**, **Node.js / Express**, **MongoDB / Mongoose** (Support Local et **MongoDB Atlas Cloud**), et **JWT**.

---

## 🌟 Architecture & Nouveautés

- 📄 **Architecture Multi-Pages (0 Modals)** :
  - `/` : Accueil avec catalogue, recherche dynamique et filtres.
  - `/product/:id` : Page détaillée de produit avec galerie, spécifications, stock et avis clients.
  - `/cart` : Panier complet avec jauge de livraison gratuite et gestion des codes promo.
  - `/checkout` : Tunnel de commande complet en 2 colonnes avec récapitulatif et sélection de paiement.
  - `/orders` : Suivi détaillé des commandes passées avec statuts dynamiques.
  - `/wishlist` : Liste des favoris avec transfert direct vers le panier.
  - `/admin` : Suite de gestion administrative (KPIs, CRUD Produits, Commandes, Coupons, Gestion des rôles).
  - `/login` & `/register` : Pages d'authentification avec comptes démo en 1-clic.

- 🎨 **Design Moderne & Icônes SVG Lucide** :
  - **Zéro Emoji** : Interface épurée inspirée de **Shadcn UI** et **Tailwind CSS v4**.
  - Icônes vectorielles SVG intégrées via `lucide-react`.

- 🗄️ **Base de Données MongoDB (Local & Cloud Atlas)** :
  - Modèles Mongoose : `User`, `Product`, `Order`, `Coupon`, `Wishlist`, `Review`.
  - Connexion automatique avec fallback intelligent : supporte MongoDB local (`127.0.0.1:27017`) et **MongoDB Atlas Cloud** (`mongodb+srv://...`).
  - Guide complet d'intégration MongoDB Atlas en arabe : [GUIDE_MONGODB_ATLAS_AR.md](./GUIDE_MONGODB_ATLAS_AR.md).

---

## 👥 Comptes de Démo Pré-enregistrés

| Profil | Email | Mot de passe | Rôle |
| :--- | :--- | :--- | :--- |
| **Administrateur** | `admin@techstore.com` | `admin123` | `admin` (Accès complet au panel `/admin`) |
| **Client Démo** | `client@test.com` | `test1234` | `customer` |

---

## 🚀 Installation & Démarrage Rapide

### 1. Installation des dépendances
```bash
npm run install:all
```

### 2. Configuration de la base de données
Par défaut, l'application se connecte à un MongoDB local. Pour connecter **MongoDB Atlas** dans le cloud :
1. Créez un fichier `.env` dans `backend/` en copiant `.env.example` :
   ```bash
   cp backend/.env.example backend/.env
   ```
2. Renseignez votre chaîne de connexion `MONGO_URI` (voir le guide [GUIDE_MONGODB_ATLAS_AR.md](./GUIDE_MONGODB_ATLAS_AR.md)).
3. Initialisez la base de données avec les données de test :
   ```bash
   node backend/seed.js
   ```

### 3. Lancement de l'application
```bash
npm run dev
```

- **Frontend React (Vite) :** [http://localhost:3001](http://localhost:3001)
- **Backend API (Express) :** [http://localhost:5001](http://localhost:5001)

---

## 📡 Endpoints REST Principaux

| Méthode | Route | Description | Accès |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/products` | Liste filtrée/triée des produits | Public |
| `GET` | `/api/products/:id` | Détail d'un produit et ses avis | Public |
| `POST` | `/api/auth/register` | Inscription nouvel utilisateur | Public |
| `POST` | `/api/auth/login` | Connexion et délivrance du JWT | Public |
| `POST` | `/api/orders` | Création et paiement d'une commande | Connecté (JWT) |
| `GET` | `/api/orders/my-orders` | Historique personnel des commandes | Connecté (JWT) |
| `GET` | `/api/admin/overview` | Statistiques et KPIs de la plateforme | Admin |
| `POST` | `/api/admin/products` | Création d'un nouveau produit | Admin |
| `PUT` | `/api/admin/products/:id` | Modification / réapprovisionnement | Admin |
| `DELETE` | `/api/admin/products/:id` | Suppression d'un produit | Admin |
| `GET` | `/api/coupons` | Gestion des codes promotionnels | Public / Admin |
