// src/components/Navbar.tsx
"use client";

import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";

export function Navbar() {
  const { data: session, status } = useSession();

  return (
    <nav className="border-b border-slate-800 mb-6">
      <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold">
          MusiStat
        </Link>

        <div className="flex items-center gap-4">
          {status === "loading" && <span className="text-sm">...</span>}

          {status === "unauthenticated" && (
            <button
              onClick={() => signIn("spotify")}
              className="px-3 py-1 rounded-lg bg-green-500 text-black text-sm font-semibold"
            >
              Connexion Spotify
            </button>
          )}

          {status === "authenticated" && (
            <>
              <span className="text-sm text-slate-300">
                {session.user?.name || session.user?.email}
              </span>
              <Link
                href="/dashboard"
                className="px-3 py-1 rounded-lg bg-slate-800 text-sm"
              >
                Dashboard
              </Link>
              <button
                onClick={() => signOut()}
                className="px-3 py-1 rounded-lg bg-slate-700 text-sm"
              >
                Déconnexion
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
