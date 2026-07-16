# NEOPMO — Suivi & Pilotage de Projets

Application de suivi de projets (dashboard, saisie hebdomadaire, formations,
tickets NeoProject, facturation) en HTML/CSS/JS pur, avec stockage partagé
via [Supabase](https://supabase.com).

---

## 1. Mettre le code sur GitHub

Dans le dossier du projet (celui qui contient `index.html`, `app.js`, `style.css`...) :

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/<votre-compte>/<nom-du-repo>.git
git push -u origin main
```

> Créez d'abord le dépôt vide sur github.com (bouton "New repository"),
> sans README ni .gitignore générés automatiquement, pour éviter les
> conflits avec le `git push` ci-dessus.

---

## 2. Créer la base de données sur Supabase

1. Allez sur [supabase.com](https://supabase.com) → créez un compte (gratuit) → **New project**.
2. Choisissez un nom, un mot de passe de base de données (à conserver précieusement), une région proche de vos utilisateurs.
3. Une fois le projet créé, ouvrez **SQL Editor** (menu de gauche) → **New query**.
4. Copiez-collez le contenu du fichier [`supabase_schema.sql`](./supabase_schema.sql) fourni dans ce dépôt, puis cliquez sur **Run**.
   - Cela crée la table `workspace_state`, active la sécurité (RLS) et insère une ligne de données vide.
5. Allez dans **Project Settings > API**. Notez deux valeurs :
   - **Project URL** (ex: `https://xxxxxxxx.supabase.co`)
   - **anon public** key (une longue chaîne de caractères)

---

## 3. Connecter l'application à Supabase

Ouvrez le fichier `config.js` à la racine du projet et complétez :

```js
const SUPABASE_URL = 'https://xxxxxxxx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOi...(votre clé anon)...';
```

Sauvegardez, puis poussez ce changement sur GitHub :

```bash
git add config.js
git commit -m "Configuration Supabase"
git push
```

> Si vous laissez `config.js` vide, l'application continue de fonctionner
> normalement, mais en local uniquement (comme avant) : chaque utilisateur
> aura ses propres données dans son navigateur, sans partage.

---

## 4. Déployer le site pour avoir une URL publique

La façon la plus simple : **Vercel** ou **Netlify**, connectés à votre dépôt GitHub.

### Avec Vercel
1. Allez sur [vercel.com](https://vercel.com) → connectez-vous avec votre compte GitHub.
2. **Add New... > Project** → sélectionnez votre dépôt.
3. Aucune configuration de build nécessaire (site statique) → **Deploy**.
4. Vous obtenez une URL du type `https://votre-projet.vercel.app`, accessible par toute votre équipe.
5. À chaque `git push` sur `main`, le site se redéploie automatiquement.

### Avec Netlify
Même principe : "Add new site" → "Import an existing project" → connecter le dépôt GitHub → Deploy.

---

## 5. Vérifier que tout fonctionne

1. Ouvrez l'URL publique dans deux navigateurs différents (ou un navigateur normal + un onglet privé).
2. Ajoutez un projet ou une donnée dans l'un.
3. Rafraîchissez l'autre : la donnée doit apparaître également.

Si ce n'est pas le cas :
- Vérifiez la console du navigateur (F12) pour un message d'erreur Supabase.
- Vérifiez que `SUPABASE_URL` et `SUPABASE_ANON_KEY` dans `config.js` sont corrects et sans espace superflu.
- Vérifiez dans Supabase (Table Editor > `workspace_state`) qu'une ligne `id = 'main'` existe bien et se met à jour.

---

## ⚠️ Points importants à connaître

- **Par défaut, aucune authentification n'est active** tant que l'étape 6 n'a pas été réalisée : toute personne disposant de l'URL du site peut consulter ET modifier les données. Voir la section [6. Protéger l'accès avec un mot de passe](#6-protéger-laccès-avec-un-mot-de-passe-authentification) pour restreindre l'accès à votre équipe.
- **Toutes les données partagent une seule ligne JSON** (`workspace_state`, id `main`). C'est volontairement simple pour une migration rapide depuis le `localStorage`. En cas de modifications simultanées par deux utilisateurs à quelques secondes d'intervalle, la dernière sauvegarde écrase la précédente (pas de fusion automatique). Pour une utilisation plus intensive à plusieurs, on pourra faire évoluer le schéma vers des tables séparées (`projects`, `tickets`, etc.) avec des mises à jour ligne par ligne.
- La clé **anon** de Supabase est prévue pour être visible publiquement (ce n'est pas un mot de passe secret) : la sécurité réelle repose sur les *policies* RLS définies dans `supabase_schema.sql`.

---

## 6. Protéger l'accès avec un mot de passe (authentification)

Par défaut (étapes 1 à 5), n'importe qui avec l'URL du site peut voir et modifier les données. Cette étape ajoute un vrai écran de connexion (email + mot de passe) avant d'accéder à l'application.

> ⚠️ Une simple "case mot de passe" côté front-end ne suffirait pas : la clé
> Supabase étant visible dans le code source de la page, n'importe qui pourrait
> contourner un écran cosmétique et appeler directement l'API Supabase. La
> vraie protection se fait donc à deux niveaux : (1) un écran de connexion
> réel via Supabase Auth, et (2) des règles côté base de données (RLS) qui
> exigent d'être connecté pour lire/écrire — c'est ce que met en place cette
> étape.

### 6.1 Restreindre l'accès à la base de données

Dans Supabase, allez dans **SQL Editor > New query**, collez le contenu de [`supabase_auth_policies.sql`](./supabase_auth_policies.sql), puis **Run**.

Cela remplace les règles "accès public" par des règles "accès réservé aux utilisateurs connectés".

### 6.2 Désactiver les inscriptions publiques

Vous ne voulez pas que n'importe qui puisse créer un compte lui-même. Dans Supabase :
1. Allez dans **Authentication > Sign In / Providers** (menu de gauche)
2. Repérez le réglage **"Allow new users to sign up"**
3. **Désactivez-le**, puis sauvegardez

Résultat : seuls les comptes que **vous** créez manuellement pourront se connecter.

### 6.3 Créer les comptes de votre équipe

Toujours dans Supabase :
1. Allez dans **Authentication > Users**
2. Cliquez sur **Add user > Create new user**
3. Renseignez un email et un mot de passe pour chaque personne devant accéder à l'application
4. Cochez "Auto Confirm User" (pour ne pas avoir besoin d'un email de confirmation)
5. Répétez pour chaque membre de l'équipe

### 6.4 Mettre à jour le code

Le code de l'application (`index.html`, `app.js`, `style.css`) contient déjà l'écran de connexion — il ne s'active automatiquement que si `config.js` est rempli (ce qui est votre cas). Il n'y a rien d'autre à modifier : poussez simplement les fichiers si vous ne l'avez pas encore fait :

```bash
git add .
git commit -m "Ajout de l'authentification"
git push
```

Vercel redéploiera automatiquement.

### 6.5 Tester

1. Ouvrez l'URL du site dans un navigateur privé : un écran "Accès réservé" doit apparaître, bloquant l'accès au tableau de bord.
2. Connectez-vous avec l'un des comptes créés à l'étape 6.3 : vous devez arriver normalement sur le dashboard.
3. Le bouton de déconnexion (icône en haut à droite, à côté du thème) vous ramène à l'écran de connexion.

---

## Structure du projet

```
index.html            Structure de la page (onglets, tableaux, modales, calendrier...)
style.css              Habillage visuel (thème sombre/clair)
app.js                  Toute la logique applicative (rendu, calculs, événements)
config.js               Clés de connexion Supabase (à compléter)
supabase_schema.sql     Script SQL à exécuter une fois dans Supabase
supabase_auth_policies.sql  Script SQL optionnel (étape 6) pour restreindre l'accès aux utilisateurs connectés
```
