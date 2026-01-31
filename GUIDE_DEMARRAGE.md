# 🌙 ECLIPSE - GUIDE DE DÉMARRAGE COMPLET

Ce fichier contient **TOUTES** les étapes pour lancer et utiliser Eclipse.
Suis chaque étape dans l'ordre. Si tu bloques, relis l'étape concernée.

---

## 📋 SOMMAIRE

1. [Lancer en mode développement](#1-lancer-en-mode-développement)
2. [Lancer avec Electron (application desktop)](#2-lancer-avec-electron-application-desktop)
3. [Créer l'installateur Windows](#3-créer-linstallateur-windows)
4. [Configurer Supabase (optionnel mais recommandé)](#4-configurer-supabase-optionnel)
5. [Structure du projet](#5-structure-du-projet)
6. [Résolution des problèmes](#6-résolution-des-problèmes)

---

## 1. LANCER EN MODE DÉVELOPPEMENT

### Étape 1.1 : Ouvrir le terminal
1. Ouvre **VS Code** ou **Windows Terminal**
2. Navigue vers le dossier du projet :
   ```powershell
   cd d:\Code\Eclipse.github.io
   ```

### Étape 1.2 : Lancer le serveur
```powershell
npm run dev
```

### Étape 1.3 : Ouvrir l'application
1. Attends de voir ce message :
   ```
   VITE v5.x.x  ready in XXX ms
   ➜  Local:   http://localhost:5173/
   ```
2. Ouvre ton navigateur
3. Va sur **http://localhost:5173/**

### Étape 1.4 : Utiliser l'application
1. Tu verras la page de connexion Eclipse
2. Clique sur **"Se connecter"** (pas besoin de mot de passe en mode démo)
3. Tu es maintenant dans le **Nexus** (tableau de bord)

### Étape 1.5 : Arrêter le serveur
Appuie sur `Ctrl + C` dans le terminal

---

## 2. LANCER AVEC ELECTRON (APPLICATION DESKTOP)

### Étape 2.1 : Ouvrir 2 terminaux
Tu as besoin de **2 terminaux** séparés.

### Étape 2.2 : Terminal 1 - Lancer Vite
```powershell
cd d:\Code\Eclipse.github.io
npm run dev
```
**Laisse ce terminal ouvert !**

### Étape 2.3 : Terminal 2 - Lancer Electron
**Attends** que Vite affiche "ready", puis :
```powershell
cd d:\Code\Eclipse.github.io
$env:NODE_ENV="development"; npx electron .
```

### Résultat attendu
- Une fenêtre Eclipse s'ouvre (application desktop)
- C'est identique au navigateur mais dans sa propre fenêtre
- Les contrôles de fenêtre (minimiser, maximiser, fermer) sont en haut à droite

### Arrêter
1. Ferme la fenêtre Electron
2. Appuie sur `Ctrl + C` dans le Terminal 1

---

## 3. CRÉER L'INSTALLATEUR WINDOWS

### Étape 3.1 : Créer une icône PNG (REQUIS)
⚠️ **IMPORTANT** : Tu dois créer une icône PNG de 256x256 pixels.

**Option A : Utiliser un outil en ligne**
1. Va sur https://www.favicon-generator.org/
2. Upload une image carrée
3. Télécharge le PNG 256x256
4. Renomme-le `eclipse-icon.png`
5. Place-le dans `d:\Code\Eclipse.github.io\public\`

**Option B : Utiliser une image existante**
Si tu as déjà une image :
```powershell
# Copie ton image dans public/ et renomme-la eclipse-icon.png
```

### Étape 3.2 : Builder l'application
```powershell
cd d:\Code\Eclipse.github.io
npm run electron:build
```

### Étape 3.3 : Trouver l'installateur
1. Attends que la commande se termine (peut prendre 2-5 minutes)
2. L'installateur sera dans : `d:\Code\Eclipse.github.io\release\`
3. Tu trouveras un fichier `Eclipse Setup X.X.X.exe`

### Étape 3.4 : Installer Eclipse
1. Double-clique sur `Eclipse Setup X.X.X.exe`
2. Suis l'assistant d'installation
3. Eclipse sera installé et un raccourci sera créé sur le Bureau

---

## 4. CONFIGURER SUPABASE (OPTIONNEL)

> **Sans Supabase**, l'app fonctionne en **mode démo** avec des données fictives.
> C'est parfait pour tester, mais pour une vraie communauté, tu auras besoin de Supabase.

### Étape 4.1 : Créer un compte Supabase
1. Va sur https://supabase.com/
2. Clique sur **"Start your project"**
3. Connecte-toi avec GitHub (recommandé) ou email

### Étape 4.2 : Créer un nouveau projet
1. Clique sur **"New Project"**
2. Remplis les infos :
   - **Name** : Eclipse
   - **Database Password** : choisis un mot de passe fort (note-le !)
   - **Region** : choisis le plus proche de toi (ex: Paris)
3. Clique sur **"Create new project"**
4. ⏳ Attends 2-3 minutes que le projet soit créé

### Étape 4.3 : Récupérer les clés API
1. Dans ton projet Supabase, va dans **Settings** (roue dentée)
2. Clique sur **API** dans le menu de gauche
3. Tu verras :
   - **Project URL** : copie cette URL (ex: `https://xxxxx.supabase.co`)
   - **anon public** : copie cette clé (commence par `eyJ...`)

### Étape 4.4 : Configurer Eclipse
1. Dans le dossier Eclipse, crée un fichier `.env` :
   ```powershell
   cd d:\Code\Eclipse.github.io
   Copy-Item .env.example .env
   ```
2. Ouvre `.env` dans un éditeur de texte
3. Remplis les valeurs :
   ```env
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJxxx...
   ```
4. Sauvegarde le fichier

### Étape 4.5 : Créer les tables de base de données
1. Dans Supabase, va dans **SQL Editor** (menu de gauche)
2. Clique sur **"New query"**
3. Copie-colle ce SQL :

```sql
-- Profils utilisateurs
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  avatar_level INTEGER DEFAULT 1,
  shadow_points INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activer RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Politique : les utilisateurs peuvent voir tous les profils
CREATE POLICY "Profiles are viewable by everyone" 
ON profiles FOR SELECT USING (true);

-- Politique : les utilisateurs peuvent modifier leur propre profil
CREATE POLICY "Users can update own profile" 
ON profiles FOR UPDATE USING (auth.uid() = id);

-- Politique : insertion automatique à la création du compte
CREATE POLICY "Users can insert their own profile" 
ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Canaux de discussion
CREATE TABLE channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insérer les canaux par défaut
INSERT INTO channels (name, description, icon, category) VALUES
  ('code', 'Discussion dev & projets', 'Code', 'thématique'),
  ('combat', 'MMA, boxe & arts martiaux', 'Swords', 'thématique'),
  ('mindset', 'Développement personnel', 'Brain', 'thématique'),
  ('général', 'Discussion libre', 'Coffee', 'communauté');

-- Messages
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID REFERENCES channels(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Messages are viewable by everyone" 
ON messages FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert messages" 
ON messages FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Activités (pour le heatmap)
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  category TEXT,
  points INTEGER DEFAULT 1,
  date DATE DEFAULT CURRENT_DATE,
  metadata JSONB
);

ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own activities" 
ON activities FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activities" 
ON activities FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Défis
CREATE TABLE challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  duration_days INTEGER,
  difficulty TEXT,
  reward INTEGER DEFAULT 100,
  start_date DATE,
  end_date DATE,
  created_by UUID REFERENCES profiles(id),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Challenges are viewable by everyone" 
ON challenges FOR SELECT USING (true);

-- Participations aux défis
CREATE TABLE challenge_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  progress INTEGER DEFAULT 0,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  completed BOOLEAN DEFAULT FALSE,
  UNIQUE(challenge_id, user_id)
);

ALTER TABLE challenge_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants viewable by everyone" 
ON challenge_participants FOR SELECT USING (true);

CREATE POLICY "Users can join challenges" 
ON challenge_participants FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own participation" 
ON challenge_participants FOR UPDATE USING (auth.uid() = user_id);
```

4. Clique sur **"Run"** (ou Ctrl+Enter)
5. Tu devrais voir "Success" pour chaque commande

### Étape 4.6 : Activer l'authentification
1. Dans Supabase, va dans **Authentication** > **Providers**
2. **Email** devrait être activé par défaut
3. (Optionnel) Active **Google**, **GitHub**, etc. si tu veux

### Étape 4.7 : Redémarrer Eclipse
1. Arrête le serveur Vite si il tourne (`Ctrl + C`)
2. Relance : `npm run dev`
3. Maintenant tu peux créer de vrais comptes utilisateurs !

---

## 5. STRUCTURE DU PROJET

```
d:\Code\Eclipse.github.io\
│
├── 📁 electron/           # Code Electron (desktop)
│   ├── main.js            # Process principal
│   └── preload.cjs        # Script de préchargement
│
├── 📁 public/             # Assets statiques
│   └── eclipse-icon.svg   # Icône de l'app
│
├── 📁 scripts/            # Scripts utilitaires
│   └── wait-and-launch.js # Lancement Electron
│
├── 📁 src/                # Code source React
│   ├── 📁 components/     # Composants réutilisables
│   │   ├── 📁 layout/     # Sidebar, TopBar
│   │   └── 📁 progress/   # Heatmap, Constellation
│   │
│   ├── 📁 pages/          # Pages de l'app
│   │   ├── 📁 Auth/       # Connexion/Inscription
│   │   ├── 📁 Nexus/      # Dashboard
│   │   ├── 📁 Channels/   # Chat
│   │   ├── 📁 Events/     # Défis
│   │   ├── 📁 Leaderboard/# Classement
│   │   └── 📁 Profile/    # Profil
│   │
│   ├── 📁 lib/            # Utilitaires
│   │   └── supabase.js    # Client Supabase
│   │
│   ├── 📁 store/          # État global
│   │   └── authStore.js   # Authentification
│   │
│   ├── App.jsx            # Composant racine
│   ├── main.jsx           # Point d'entrée
│   └── index.css          # Styles globaux
│
├── .env                   # Variables d'environnement (à créer)
├── .env.example           # Exemple de configuration
├── package.json           # Dépendances
├── vite.config.js         # Config Vite
└── tailwind.config.js     # Config Tailwind
```

---

## 6. RÉSOLUTION DES PROBLÈMES

### ❌ "npm run dev" affiche une erreur
**Solution** : Réinstalle les dépendances
```powershell
cd d:\Code\Eclipse.github.io
Remove-Item -Recurse -Force node_modules
npm install
```

### ❌ Electron ne se lance pas
**Vérifie** :
1. Que Vite tourne dans le Terminal 1
2. Que tu as bien défini `NODE_ENV=development`

**Solution alternative** :
```powershell
# Dans un seul terminal
npm run dev
# Attends que Vite soit prêt, puis ouvre un nouveau terminal
npx electron .
```

### ❌ Page blanche dans le navigateur
**Solution** : Vérifie la console du navigateur (F12) pour les erreurs

### ❌ "Cannot find module" lors du build
**Solution** :
```powershell
npm install
npm run build
```

### ❌ L'installateur ne se crée pas
**Vérifie** :
1. Que tu as une icône PNG dans `public/eclipse-icon.png`
2. Que le build Vite a réussi

**Solution** :
```powershell
npm run build
# Si ça réussit, alors :
npm run electron:build
```

---

## 🎉 TU ES PRÊT !

L'application Eclipse est maintenant configurée. 

**Mode démo** : Clique juste sur "Se connecter" pour explorer.
**Mode production** : Configure Supabase (section 4) pour de vrais utilisateurs.

Bonne utilisation ! 🌙
