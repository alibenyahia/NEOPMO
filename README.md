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

- **Aucune authentification n'est mise en place par défaut** : toute personne disposant de l'URL du site peut consulter ET modifier les données. C'est adapté à un usage en équipe restreinte/interne. Si vous voulez restreindre l'accès, Supabase propose un système d'authentification (email/mot de passe, magic link, SSO...) qu'on peut ajouter dans un second temps.
- **Toutes les données partagent une seule ligne JSON** (`workspace_state`, id `main`). C'est volontairement simple pour une migration rapide depuis le `localStorage`. En cas de modifications simultanées par deux utilisateurs à quelques secondes d'intervalle, la dernière sauvegarde écrase la précédente (pas de fusion automatique). Pour une utilisation plus intensive à plusieurs, on pourra faire évoluer le schéma vers des tables séparées (`projects`, `tickets`, etc.) avec des mises à jour ligne par ligne.
- La clé **anon** de Supabase est prévue pour être visible publiquement (ce n'est pas un mot de passe secret) : la sécurité réelle repose sur les *policies* RLS définies dans `supabase_schema.sql`.

---

## Structure du projet

```
index.html            Structure de la page (onglets, tableaux, modales, calendrier...)
style.css              Habillage visuel (thème sombre/clair)
app.js                  Toute la logique applicative (rendu, calculs, événements)
config.js               Clés de connexion Supabase (à compléter)
supabase_schema.sql     Script SQL à exécuter une fois dans Supabase
```
