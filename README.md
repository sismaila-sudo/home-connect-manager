# HOME CONNECT MANAGER

Application web complète de gestion de foyer multi-utilisateurs

## 🏗️ Architecture

- **Frontend**: React.js avec TypeScript et Tailwind CSS
- **Backend**: Node.js avec Express et PostgreSQL
- **Authentification**: JWT avec OAuth Google
- **Design**: Responsive et PWA

## 📋 Fonctionnalités

- ✅ Système multi-utilisateurs avec rôles
- ✅ Dashboard intelligent avec métriques temps réel
- ✅ Gestion des tâches avancée avec gamification
- ✅ Planning des repas avec auto-génération des courses
- ✅ Gestion courses et budget avec OCR
- ✅ Système de signalements avec géolocalisation
- ✅ Notifications push et mode hors-ligne

## 🚀 Installation

### Prérequis
- Node.js (v18+)
- PostgreSQL (v14+)
- npm ou yarn

### Backend
```bash
cd backend
npm install
cp .env.example .env
# Configurer les variables d'environnement
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm start
```

### Base de données
```bash
cd database
# Exécuter les scripts de création
psql -U postgres -d homeconnect -f schema.sql
psql -U postgres -d homeconnect -f seed.sql
```

## 📁 Structure du projet

```
home-connect-manager/
├── backend/                 # API Node.js/Express
│   ├── src/
│   │   ├── controllers/     # Logique métier
│   │   ├── models/         # Modèles de données
│   │   ├── routes/         # Routes API
│   │   ├── middleware/     # Middlewares
│   │   ├── services/       # Services métier
│   │   ├── config/         # Configuration
│   │   └── utils/          # Utilitaires
│   └── tests/              # Tests backend
├── frontend/               # Application React
│   ├── src/
│   │   ├── components/     # Composants React
│   │   ├── pages/          # Pages de l'app
│   │   ├── hooks/          # Hooks personnalisés
│   │   ├── services/       # Services API
│   │   ├── utils/          # Utilitaires
│   │   ├── types/          # Types TypeScript
│   │   └── assets/         # Assets statiques
│   └── public/             # Fichiers publics
├── database/               # Scripts SQL
├── docs/                   # Documentation
└── deployment/             # Scripts de déploiement
```

## 🔧 Configuration

### Variables d'environnement (Backend)
```env
DATABASE_URL=postgresql://username:password@localhost:5432/homeconnect
JWT_SECRET=your-jwt-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
PORT=5000
```

## 👥 Contributeurs

Développé avec ❤️ pour simplifier la gestion de foyer

🚀 **Déployé sur Vercel + Supabase**