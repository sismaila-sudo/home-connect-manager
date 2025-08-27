# 🚀 Démarrage Rapide avec Docker

Ce guide vous permet de lancer l'application HOME CONNECT MANAGER en quelques minutes avec Docker.

## Prérequis

- **Docker** et **Docker Compose** installés sur votre système
  - Windows : Docker Desktop
  - Mac : Docker Desktop
  - Linux : Docker Engine + Docker Compose

## 🏃‍♂️ Démarrage Ultra-Rapide

```bash
# 1. Naviguez vers le dossier du projet
cd home-connect-manager

# 2. Lancez toute l'application avec une seule commande
docker-compose up -d

# 3. Attendez que tous les services soient prêts (environ 30-60 secondes)
docker-compose logs -f

# 4. Ouvrez votre navigateur sur http://localhost:3000
```

## 📋 Comptes de Test

Une fois l'application lancée, connectez-vous avec :

### Gestionnaire Principal
- **URL :** http://localhost:3000
- **Email :** marie.martin@email.com  
- **Mot de passe :** password123

### Membres avec Code
- **Code :** LUCIE01 (Membre)
- **Code :** PIERRE01 (Co-gestionnaire)

## 🔍 Vérifications

### Vérifiez que tous les services fonctionnent :

```bash
# Statut des conteneurs
docker-compose ps

# Vous devriez voir :
# - homeconnect-db (postgres) - healthy
# - homeconnect-api (backend) - running
# - homeconnect-web (frontend) - running
```

### URLs importantes :
- **Application :** http://localhost:3000
- **API Backend :** http://localhost:5000/health
- **Base de données :** localhost:5432

## 🛑 Arrêter l'application

```bash
# Arrêter tous les services
docker-compose down

# Arrêter et supprimer toutes les données
docker-compose down -v
```

## 🔧 Commandes Utiles

```bash
# Voir les logs de tous les services
docker-compose logs -f

# Voir les logs d'un service spécifique
docker-compose logs -f backend
docker-compose logs -f frontend

# Redémarrer un service
docker-compose restart backend

# Mettre à jour après modifications du code
docker-compose down
docker-compose up -d --build

# Accéder au shell du backend
docker-compose exec backend sh

# Accéder à PostgreSQL
docker-compose exec postgres psql -U postgres -d homeconnect
```

## 🎯 Prochaines Étapes

1. **Explorez l'interface** avec les comptes de test
2. **Testez les différents rôles** (propriétaire, co-gestionnaire, membre)  
3. **Créez de nouveaux membres** depuis l'interface d'administration
4. **Personnalisez** selon vos besoins

## 🆘 Problèmes Courants

### Port 3000 ou 5000 déjà utilisé
Modifiez les ports dans `docker-compose.yml` :
```yaml
ports:
  - "3001:3000"  # Frontend sur port 3001
  - "5001:5000"  # Backend sur port 5001
```

### Base de données ne se connecte pas
```bash
# Vérifiez les logs de la base de données
docker-compose logs postgres

# Redémarrez uniquement la DB
docker-compose restart postgres
```

### Permissions de fichiers (Linux/Mac)
```bash
# Donnez les permissions au dossier uploads
sudo chmod -R 755 backend/uploads/
```

---

🎉 **C'est tout !** Votre application HOME CONNECT MANAGER est maintenant prête à l'emploi !