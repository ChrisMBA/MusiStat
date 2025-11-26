// src/lib/auth.ts
import type { NextAuthOptions } from "next-auth";
import SpotifyProvider from "next-auth/providers/spotify";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "./prisma";

const scopes = [
  "user-read-email",
  "user-top-read",
  "user-read-recently-played",
].join(" ");

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
          await prisma.user.update({
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
      if (account && account.provider === "spotify") {
        token.accessToken = account.access_token;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user && token) {
        (session.user as any).accessToken = token.accessToken;
      }
      return session;
    },
  },
};
