// src/types/next-auth.d.ts
import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    /** Token d'accès Spotify, à utiliser pour appeler l'API Web Spotify */
    accessToken?: string;
    /** Renseigné si le rafraîchissement du token a échoué : il faut se reconnecter */
    error?: "RefreshAccessTokenError";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    /** Date d'expiration du token d'accès, en millisecondes (timestamp) */
    accessTokenExpires?: number;
    error?: "RefreshAccessTokenError";
  }
}
