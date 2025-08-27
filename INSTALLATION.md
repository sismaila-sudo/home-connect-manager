# Guide d'Installation - HOME CONNECT MANAGER

Ce guide vous explique comment installer et lancer l'application HOME CONNECT MANAGER étape par étape.

## 🔧 Prérequis

Avant de commencer, assurez-vous d'avoir installé :

1. **Node.js** (version 18 ou supérieure)
   - Téléchargez depuis : https://nodejs.org/
   - Vérifiez l'installation : `node --version` et `npm --version`

2. **PostgreSQL** (version 14 ou supérieure)
   - Téléchargez depuis : https://www.postgresql.org/download/
   - Ou utilisez un service cloud comme Railway, Supabase, etc.

3. **Git** (optionnel, pour cloner le projet)
   - Téléchargez depuis : https://git-scm.com/

## 📋 Installation Étape par Étape

### Étape 1 : Installation des dépendances

#### Backend
```bash
# Naviguez vers le dossier backend
cd backend

# Installez les dépendances
npm install
```

#### Frontend
```bash
# Naviguez vers le dossier frontend (dans un nouveau terminal)
cd frontend

# Installez les dépendances
npm install

# Installez les dépendances manquantes
npm install clsx @tailwindcss/forms
```

### Étape 2 : Configuration de la base de données

#### Option A : PostgreSQL local

1. **Créez une base de données :**
```sql
-- Connectez-vous à PostgreSQL (psql, pgAdmin, ou autre)
CREATE DATABASE homeconnect;
```

2. **Créez le schéma :**
```bash
# Depuis le dossier racine du projet
psql -U postgres -d homeconnect -f database/schema.sql
```

3. **Ajoutez les données de démonstration :**
```bash
psql -U postgres -d homeconnect -f database/seed.sql
```

#### Option B : PostgreSQL avec Docker
```bash
# Lancez PostgreSQL avec Docker
docker run -d \
  --name homeconnect-db \
  -e POSTGRES_DB=homeconnect \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password123 \
  -p 5432:5432 \
  postgres:15

# Attendez quelques secondes puis créez le schéma
docker exec -i homeconnect-db psql -U postgres -d homeconnect < database/schema.sql
docker exec -i homeconnect-db psql -U postgres -d homeconnect < database/seed.sql
```

### Étape 3 : Configuration du Backend

1. **Copiez le fichier de configuration :**
```bash
cd backend
cp .env.example .env
```

2. **Éditez le fichier `.env` :**
```env
# Database Configuration
DATABASE_URL=postgresql://postgres:password123@localhost:5432/homeconnect
DB_HOST=localhost
DB_PORT=5432
DB_NAME=homeconnect
DB_USER=postgres
DB_PASSWORD=password123

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=votre-cle-secrete-jwt-changez-moi-en-production
JWT_EXPIRES_IN=7d

# OAuth Configuration (optionnel pour le moment)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Email Configuration (optionnel)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Autres configurations
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Étape 4 : Lancement de l'application

#### 1. Démarrez le Backend
```bash
# Dans le dossier backend
cd backend
npm run dev
```

Vous devriez voir :
```
🚀 Server running on port 5000
📝 Environment: development
🔗 API: http://localhost:5000/api
💚 Health: http://localhost:5000/health
✅ Database connected successfully
```

#### 2. Démarrez le Frontend (dans un nouveau terminal)
```bash
# Dans le dossier frontend
cd frontend
npm run dev
```

Vous devriez voir :
```
VITE v4.4.9  ready in 500ms

➜  Local:   http://localhost:3000/
➜  Network: use --host to expose
```

### Étape 5 : Accédez à l'application

Ouvrez votre navigateur et allez sur : **http://localhost:3000**

## 🧪 Comptes de Test

L'application est pré-configurée avec des comptes de démonstration :

### Gestionnaire Principal
- **Email :** marie.martin@email.com
- **Mot de passe :** password123

### Connexion Membre (avec code)
- **Code :** LUCIE01
- **Code :** AHMED01
- **Code :** PIERRE01

## 🛠️ Résolution de Problèmes

### Erreur de connexion à la base de données
- Vérifiez que PostgreSQL est démarré
- Vérifiez les informations de connexion dans le fichier `.env`
- Testez la connexion : `psql -U postgres -d homeconnect -c "SELECT NOW();"`

### Port 5000 déjà utilisé
Changez le port dans `backend/.env` :
```env
PORT=5001
```

### Port 3000 déjà utilisé
Le frontend vous proposera automatiquement un autre port (3001, 3002, etc.)

### Erreur "Module not found"
```bash
# Réinstallez les dépendances
cd backend && npm install
cd ../frontend && npm install
```

### Problème avec les dépendances TypeScript
```bash
cd frontend
npm install --save-dev @types/node @types/react @types/react-dom
```

## 🔍 Vérifications

### Vérifier que tout fonctionne

1. **API Health Check :**
   - Allez sur http://localhost:5000/health
   - Vous devriez voir un JSON avec le statut "OK"

2. **Test de connexion :**
   - Allez sur http://localhost:3000
   - Connectez-vous avec marie.martin@email.com / password123
   - Vous devriez accéder au tableau de bord

3. **Test connexion membre :**
   - Déconnectez-vous
   - Utilisez l'onglet "Code membre" avec le code LUCIE01

## 📝 Scripts Disponibles

### Backend
- `npm run dev` - Démarre le serveur en mode développement
- `npm start` - Démarre le serveur en mode production
- `npm test` - Lance les tests

### Frontend
- `npm run dev` - Démarre l'application en mode développement
- `npm run build` - Build l'application pour la production
- `npm run preview` - Prévisualise le build de production

## 🎯 Prochaines Étapes

Maintenant que l'application est installée :

1. **Explorez les fonctionnalités** dans les différentes sections
2. **Créez de nouveaux membres** via l'interface d'administration
3. **Testez les différents rôles** (owner, co_manager, member)
4. **Personnalisez** les catégories et templates selon vos besoins

## 📞 Support

Si vous rencontrez des problèmes :

1. Vérifiez les logs dans le terminal (backend et frontend)
2. Consultez la console du navigateur (F12) pour les erreurs frontend
3. Vérifiez que tous les services sont démarrés (PostgreSQL, Backend, Frontend)

---

🎉 **Félicitations !** Votre application HOME CONNECT MANAGER est maintenant opérationnelle !