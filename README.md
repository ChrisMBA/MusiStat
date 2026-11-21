# MusiStat 🎧

Application de statistiques Spotify : connecte ton compte et découvre tes artistes, titres et genres préférés.

## Stack

- [Next.js](https://nextjs.org) 16 (App Router), React 19, TypeScript
- [Tailwind CSS](https://tailwindcss.com) 4
- [NextAuth](https://next-auth.js.org) v4 avec le provider Spotify (rafraîchissement automatique du token)
- [Prisma](https://www.prisma.io) 7 + PostgreSQL

## Installation

### 1. Prérequis

- Node.js 20 ou plus
- Une base PostgreSQL
- Une application Spotify créée sur le [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)

Dans les paramètres de l'app Spotify, ajoute cette Redirect URI :

```
http://127.0.0.1:3000/api/auth/callback/spotify
```

> Spotify n'accepte plus `localhost` dans les Redirect URI : utilise `127.0.0.1`.

### 2. Variables d'environnement

```bash
cp .env.example .env
```

Puis remplis les valeurs :

| Variable | Description |
| --- | --- |
| `SPOTIFY_CLIENT_ID` | Client ID de l'app Spotify |
| `SPOTIFY_CLIENT_SECRET` | Client Secret de l'app Spotify |
| `NEXTAUTH_SECRET` | Secret aléatoire (`openssl rand -base64 32`) |
| `NEXTAUTH_URL` | URL de l'app, ex. `http://127.0.0.1:3000` |
| `DATABASE_URL` | Chaîne de connexion PostgreSQL |

### 3. Dépendances et base de données

```bash
npm install
npx prisma migrate dev
```

### 4. Lancer le serveur

```bash
npm run dev
```

Ouvre [http://127.0.0.1:3000](http://127.0.0.1:3000).

## Scripts

| Commande | Rôle |
| --- | --- |
| `npm run dev` | Serveur de développement |
| `npm run build` | Build de production |
| `npm run start` | Lance le build de production |
| `npm run lint` | Vérifie le code avec ESLint |
