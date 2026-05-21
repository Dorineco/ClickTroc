**Projet de stage en cours**

## Click&Troc

Application web permettant aux utilisateurs de consulter et de rédiger des petites annonces. L’objectif est de proposer une interface permettant la consultation, la rédaction et la modification des annonces, le paiement des achats. Le site permettra une recherche ciblée par région et par rubrique d’annonce. Projet réalisé en avril-mai 2026 dans le cadre de mon stage chez FW16 Mouthiers sur Boëme. 

ClickTroc intègre dès sa conception des bonnes pratiques d'accessibilité (WCAG) — rôles ARIA, gestion du focus, navigation clavier — et d'écoconception — pagination serveur, requêtes groupées, filtrage côté serveur — pour un service sobre et inclusif.


## Fonctionnalités

-Consulter les annonces récentes avec pagination
-Recherche par mots-clés, catégorie, ville et fourchette de prix
-Filtrage géographique par rayon kilométrique
-Dépôt d'annonce avec jusqu'à 6 photos
-Types d'annonces : vente, don, location, service
-Géolocalisation automatique à la création d'annonce
-Interface accessible (ARIA, navigation clavier, focus management)

## Stack technique
Frontend : React, Tailwind CSS 
Backend : Node.js, Express
Base de données: MySQL
Autres : API Geolocation, FormData, fetch, système de paiement Stripe

## Arborescence du projet
clicktroc/
│
├── frontend/                        # Application React
│   ├── public/
│   │   └── hero.jpg                 # Image hero de la page d'accueil
│   └── src/
│       ├── components/              # Composants réutilisables
│       │   ├── AdCard.jsx           # Carte d'affichage d'une annonce
│       │   ├── CategoryDropdown.jsx # Menu déroulant des catégories
│       │   └── CityAutocomplete.jsx # Champ d'autocomplétion de ville
│       ├── pages/                   # Pages de l'application
│       │   ├── Home.jsx             # Page d'accueil avec recherche et liste d'annonces
│       │   └── CreateAd.jsx         # Page de création d'annonce (wrappée)
│       ├── modals/
│       │   └── CreateAdModal.jsx    # Modale de dépôt d'annonce
│       ├── services/
│       │   └── api.js               # Fonctions d'appel à l'API (searchAds, getCategories…)
│       └── App.jsx                  # Routing principal
│
├── backend/                         # Serveur Node.js / Express
│   ├── controllers/                 # Logique métier
│   │   └── ads.controller.js
│   ├── routes/                      # Définition des routes Express
│   │   └── ads.routes.js
│   ├── models/                      # Modèles de données
│   │   └── ad.model.js
│   ├── middleware/                  # Middlewares (auth, upload…)
│   ├── uploads/                     # Images uploadées
│   └── server.js                    # Point d'entrée du serveur
│
└── README.md

