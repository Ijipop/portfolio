# Laboratoire 2 - Services Web REST

****Portfolio Web - Next.js avec Material-UI****

Portfolio web moderne développé avec Next.js 14, Material-UI, TypeScript et Prisma.

- Nadia DESJARDINS
- Jean-François LEFEBVRE,
- Natacha MEYER

## Description du projet et du domaine métier choisi

On a décidé de faire un portfolio de projets. Ceci étant dit, ce n'est pas un portfolio officiel. C'était développé avec l'intention de créer un bon portfolio qui peut être utilisé comme un modèle de base.

**Repositories:**
[Ijipop/portfolio](https://github.com/Ijipop/portfolio.git)
<!--
ancienne version:
~~[dracken24/Portfolio-2](https://github.com/dracken24/Portfolio-2)~~
-->

## Instructions d'installation et de configuration

### Prérequis

- **Node.js** 18+ ([Télécharger](https://nodejs.org/))
- **Git** ([Télécharger](https://git-scm.com/))
- **Compte Neon.tech** pour la base de données PostgreSQL

### Configuration

1. **Cloner le projet**
```bash
git clone https://github.com/your-username/portfolio.git
cd portfolio
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configurer l'environnement**
```bash
# Copier le fichier d'exemple
cp env.example .env

# Éditer le fichier .env avec vos configurations
```

4. **Configurer la base de données**
```bash
# Générer le client Prisma
npx prisma generate

# Appliquer les migrations
npx prisma db push

# Créer un utilisateur admin (optionnel)
node scripts/createAdmin.js
```

5. **Lancer l'application**
```bash
npm run dev
```

### Variables d'environnement

Copiez `env.example` vers `.env` et configurez :

```env
# Base de données PostgreSQL
DATABASE_URL="postgresql://username:password@host:port/database?sslmode=require"

# Clé secrète JWT (générez une clé forte)
JWT_SECRET="your-super-secret-jwt-key-here-minimum-32-characters"

# Environnement
NODE_ENV="development"
```

## 🔐 Authentification et Sécurité

### Fonctionnalités de sécurité implémentées

- **Authentification JWT** avec cookies HttpOnly sécurisés
- **Middleware de protection** des routes admin
- **Validation des entrées** avec Zod
- **Journalisation sécurisée** sans fuite de données sensibles
- **Contrôle d'accès** basé sur les rôles
- **Protection CSRF** avec cookies SameSite=Strict

### Endpoints d'authentification

```bash
# Connexion
POST /api/auth/login
{
  "email": "admin@portfolio.com",
  "password": "admin123"
}

# Déconnexion
POST /api/auth/logout
```

### Tests

```bash
# Lancer les tests
npm test

# Tests d'authentification
node tests/auth.test.js

# Tests des projets
node tests/projects.test.js
```

## 📚 Documentation API

- **OpenAPI** : `docs/openapi.yaml`
- **Collection Postman** : `Portfolio-API.postman_collection.json`
- **Journal de tests** : `docs/TEST_LOG.md`

## 🚀 Déploiement

L'application sera disponible sur `http://localhost:3000`

**Compte admin par défaut :**
- Email: `admin@portfolio.com`
- Mot de passe: `admin123`

**Outils utiles :**
- `npx prisma studio` - Interface de gestion de la base de données
- `npm run build` - Build de production
- `npm run start` - Serveur de production

## Architecture technique

```
PORTFOLIO/
├── app/
│   ├── a_propos
│   │   └── page.tsx
│   ├── admin/dashboard/
│   │   └── page.tsx
│   ├── api/
│   │   ├── auth/login
│   │   │  └── route.ts
│   │   └── projects/
│   │       ├── route.ts
│   │       └── [id]
│   │           └── route.ts
│   │
│   ├── components/
│   ├── contact
│   │   └── page.tsx
│   ├── contexts
│   ├── projets
│   │   └── page.tsx
│   ├── layout.tsx
│   └── page.tsx
│
├── lib/
├── prisma/
├── public/imgs/links
├── scripts/
└── tests/
```

## Captures d'écran de l'interface utilisateur

### Page d'accueil

![picture](https://github.com/Ijipop/portfolio/blob/Ji/public/imgs/readme/accueil.png)
Darkmode included!
![picture](https://github.com/Ijipop/portfolio/blob/Ji/public/imgs/readme/darkmode.png)

Et grâce au Navbar, on peut naviguer d'une page à l'autre avec ces sélections :
![picture](https://github.com/Ijipop/portfolio/blob/Ji/public/imgs/readme/navigation.png)

### Projets

![picture](https://github.com/Ijipop/portfolio/blob/Ji/public/imgs/readme/projets.png)

### A Propos

![picture](https://github.com/Ijipop/portfolio/blob/Ji/public/imgs/readme/propos.png)

### Contact

![picture](https://github.com/Ijipop/portfolio/blob/Ji/public/imgs/readme/contact.png)

### Admin

Seulement accessible aux admins
![picture](https://github.com/Ijipop/portfolio/blob/Ji/public/imgs/readme/admin_connect.png)
Les admins peuvent ajouter , supprimer et modifier les projets ici.
![picture](https://github.com/Ijipop/portfolio/blob/Ji/public/imgs/readme/admin_page.png)
Ajouter un projet
![picture](https://github.com/Ijipop/portfolio/blob/Ji/public/imgs/readme/admin_add.png)
Si on laisse une section nécessaire vide, un pop-up va l'informer.
![picture](https://github.com/Ijipop/portfolio/blob/Ji/public/imgs/readme/admin_missing.png)
On peut modifier un projet en cliquant sur le bouton avec le crayon.
![picture](https://github.com/Ijipop/portfolio/blob/Ji/public/imgs/readme/admin_edit.png)

On peut supprimer un projet en cliquant sur le bouton avec la poubelle. Un pop-up pour confirmer va apparaître.
![picture](https://github.com/Ijipop/portfolio/blob/Ji/public/imgs/readme/admin_delete.png)

Pour plus informations:

- Documentation des services ([fichier SERVICES.md](https://github.com/Ijipop/portfolio/blob/a32ed38faf62ae525a3cd6de8027445a5aa76a77/SERVICES.md))
- Analyse du code ([fichier CODE_ANALYSIS.md](https://github.com/Ijipop/portfolio/blob/7534eb129791fc8de2c82600f6670bcb9f783ad9/CODE_ANALYSIS.md))
