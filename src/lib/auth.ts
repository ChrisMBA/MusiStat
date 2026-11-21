// src/lib/auth.ts
import type { NextAuthOptions } from "next-auth";
import type { JWT } from "next-auth/jwt";
import SpotifyProvider from "next-auth/providers/spotify";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "./prisma";

const scopes = [
  "user-read-email",
  "user-top-read",
  "user-read-recently-played",
].join(" ");

const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";

// Marge de sécurité : on rafraîchit 60 s avant l'expiration réelle
const EXPIRY_MARGIN_MS = 60 * 1000;

/**
 * Demande un nouveau token d'accès à Spotify à partir du refresh token.
 * Spotify ne renvoie pas toujours un nouveau refresh token : dans ce cas on garde l'ancien.
 */
async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    if (!token.refreshToken) {
      throw new Error("Aucun refresh token disponible");
    }

    const basicAuth = Buffer.from(
      `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
    ).toString("base64");

    const response = await fetch(SPOTIFY_TOKEN_URL, {
      method: "POST",
      headers: {
        Authorization: `Basic ${basicAuth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: token.refreshToken,
      }),
      cache: "no-store",
    });

    const data = await response.json();

    if (!response.ok) {
      throw data;
    }

    return {
      ...token,
      accessToken: data.access_token,
      accessTokenExpires: Date.now() + data.expires_in * 1000,
      refreshToken: data.refresh_token ?? token.refreshToken,
      error: undefined,
    };
  } catch (err) {
    console.error("Erreur lors du rafraîchissement du token Spotify:", err);
    return { ...token, error: "RefreshAccessTokenError" };
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  providers: [
    SpotifyProvider({
      clientId: process.env.SPOTIFY_CLIENT_ID!,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: scopes,
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "spotify" && user.email) {
        try {
          // updateMany ne lève pas d'erreur si l'utilisateur n'existe pas encore
          // (cas de la toute première connexion, avant sa création par l'adapter)
          await prisma.user.updateMany({
            where: { email: user.email },
            data: { lastLogin: new Date() },
          });
        } catch (err) {
          console.error("Erreur update lastLogin:", err);
        }
      }
      return true;
    },

    async jwt({ token, account }) {
      // Première connexion : on stocke les tokens Spotify dans le JWT
      if (account && account.provider === "spotify") {
        return {
          ...token,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          accessTokenExpires: account.expires_at
            ? account.expires_at * 1000
            : Date.now() + 3600 * 1000,
        };
      }

      // Token encore valide : on le renvoie tel quel
      if (
        token.accessTokenExpires &&
        Date.now() < token.accessTokenExpires - EXPIRY_MARGIN_MS
      ) {
        return token;
      }

      // Token expiré : on le rafraîchit
      return refreshAccessToken(token);
    },

    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.error = token.error;
      return session;
    },
  },
};
