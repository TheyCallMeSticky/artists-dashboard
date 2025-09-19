# Dashboard de Consultation (`artists-dashboard`)

Ce projet est une application web Next.js qui sert d'interface utilisateur pour le service `artists-collector`. Elle permet de visualiser les données collectées, de lancer de nouvelles collectes et de suivre les opportunités identifiées.

## Fonctionnalités

- **Tableau de Bord Principal** : Affiche les meilleures opportunités d'artistes avec leur score, leurs métriques clés et des liens directs vers leurs profils Spotify et YouTube.
- **Liste Complète des Artistes** : Une vue tabulaire de tous les artistes présents dans la base de données, avec la possibilité de rafraîchir leurs données individuellement.
- **Formulaire de Collecte** : Une interface simple pour ajouter de nouveaux artistes, soit un par un, soit en lot.
- **Design Réactif** : L'interface est conçue pour être utilisée sur des écrans de bureau et mobiles.

## Structure du Projet

```
/src
├── app/
│   ├── api/          # API Routes Next.js (proxy vers le backend Python)
│   ├── (pages)/      # Pages principales de l'application (Dashboard, Collecte, Artistes)
│   │   ├── page.tsx
│   │   ├── collect/page.tsx
│   │   └── artists/page.tsx
│   └── layout.tsx    # Layout principal de l'application
├── components/       # Composants React réutilisables (ex: Navigation)
├── types/            # Définitions TypeScript pour les objets de données
└── globals.css       # Styles globaux (Tailwind CSS)
.env.local.example  # Fichier d'exemple pour les variables d'environnement
next.config.mjs     # Configuration de Next.js
```

## Mise en Route

1.  **Prérequis** :
    - Node.js (version 18 ou supérieure)
    - npm ou yarn

2.  **Installation** :

    ```bash
    cd apps/artists-dashboard
    npm install
    ```

3.  **Configuration** :
    - Copiez `.env.local.example` vers un nouveau fichier nommé `.env.local`.
    - Assurez-vous que `PYTHON_API_BASE` pointe vers l'URL de votre backend `artists-collector` (par défaut, `http://localhost:8000`).

4.  **Démarrage** :

    ```bash
    npm run dev
    ```

5.  **Accès** :
    - L'application sera disponible à l'adresse [http://localhost:3000](http://localhost:3000).

## Pages Disponibles

- **Dashboard** (`/`) : La page d'accueil qui affiche les meilleures opportunités.
- **Collecter** (`/collect`) : La page pour ajouter de nouveaux artistes.
- **Artistes** (`/artists`) : La page listant tous les artistes de la base de données.

## Communication avec le Backend

L'application Next.js ne communique pas directement avec les API externes (Spotify, YouTube) ni avec la base de données. Elle utilise des **API Routes** internes (`/api/*`) qui agissent comme un proxy sécurisé vers le backend Python `artists-collector`. Cela permet de centraliser toute la logique métier et la gestion des clés API dans le service Python, tout en offrant une expérience utilisateur fluide et réactive.
