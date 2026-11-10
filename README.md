# ⚡ TechStore - Plateforme E-Commerce Fullstack

Plateforme marchande High-Tech complète développée avec **React 18** (Vite), **Node.js / Express**, **JWT** et **Context API**.

Ce projet est la réalisation concrète du sujet d'évaluation académique `Projet_Ecommerce_Fullstack_Enonce_et_Corrige.pdf`.

---

## 🌟 Fonctionnalités Implémentées

- 📦 **Catalogue & Produits :**
  - Affichage en grille responsive de produits High-Tech avec visuels, avis étoiles, catégories et stock en temps réel.
  - Filtres instantanés par catégories (Smartphones, Ordinateurs, Audio, Écrans, Accessoires, Tablettes).
  - Barre de recherche textuelle dynamique en direct.
  - Tri par prix croissant / décroissant ou par avis clients.
- 🛒 **Panier d'Achat Interactif & Persistant :**
  - Tiroir coulissant (*Sliding Cart Drawer*) avec animation fluide.
  - Incrémentation / décrémentation des quantités avec contrôle automatique des stocks maximums.
  - Sauvegarde et synchronisation continue dans le `localStorage` (le panier ne disparaît jamais lors d'un rechargement de page).
  - Barre de progression dynamique pour débloquer la **livraison gratuite** (dès 500 € d'achat).
  - Calcul automatique en temps réel de la TVA (20%), des frais de port et du montant total TTC.
- 🔐 **Authentification Sécurisée (JWT & Bcrypt) :**
  - Formulaires d'inscription et de connexion avec boutons de test en 1-clic (*Comptes Démo*).
  - Hashage cryptographique des mots de passe avec `bcryptjs`.
  - Signature de jetons de session `jsonwebtoken` (JWT) stockés côté client et transmis via header `Authorization: Bearer <token>`.
- 💳 **Tunnel de Commande (Checkout) :**
  - Formulaire de saisie d'adresse de livraison complète.
  - Validation sécurisée côté serveur : vérification des prix, contrôle des stocks restants et déduction en direct.
  - Écran de succès avec génération d'un numéro de commande unique (ex: `CMD-XXXXXX`).
- 📜 **Historique des Commandes :**
  - Fenêtre dédiée permettant au client connecté de consulter l'ensemble de ses commandes passées, la date, le statut d'expédition et le récapitulatif des articles achetés.

---

## 👥 Comptes de Démo Pré-enregistrés (Test Rapide)

| Profil | Email | Mot de passe |
| :--- | :--- | :--- |
| **Client Démo** | `client@test.com` | `test1234` |
| **Admin Démo** | `admin@techstore.com` | `admin123` |

*(Vous pouvez également créer un nouveau compte client à tout moment via le formulaire d'inscription)*.

---

## 🚀 Installation & Démarrage Rapide

### 1. Installation des dépendances
Depuis le dossier `techstore-app/` :
```bash
npm run install:all
```

### 2. Lancement du Projet en 1 seule commande
```bash
npm start
```
*(ou `npm run dev`)*

- **Frontend React (Vite) :** [http://localhost:3001](http://localhost:3001)
- **Backend API (Express) :** [http://localhost:5001](http://localhost:5001)

---

## 📡 Documentation des Endpoints REST

| Méthode | Route | Rôle | Authentification |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/products` | Récupère la liste des produits filtrés/triés | Non requise |
| `GET` | `/api/products/categories` | Récupère la liste des catégories | Non requise |
| `POST` | `/api/auth/register` | Inscription client | Non requise |
| `POST` | `/api/auth/login` | Connexion et délivrance de token JWT | Non requise |
| `POST` | `/api/orders` | Validation et paiement de la commande | Requise (Bearer JWT) |
| `GET` | `/api/orders/my-orders` | Historique des commandes du client connecté | Requise (Bearer JWT) |

