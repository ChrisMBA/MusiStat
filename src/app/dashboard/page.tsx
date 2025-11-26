import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    redirect("/");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { lastLogin: true, name: true, email: true },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Dashboard Spotify</h1>
      <p className="text-slate-300">
        Connecté en tant que{" "}
        <span className="font-semibold">
          {user?.name || session.user.email}
        </span>
      </p>
      {user?.lastLogin && (
        <p className="text-sm text-slate-400">
          Dernière connexion :{" "}
          {user.lastLogin.toLocaleString("fr-FR")}
        </p>
      )}
      <p className="text-slate-400 text-sm">
        (Les vraies stats Spotify arrivent bientôt 😉)
      </p>
    </div>
  );
}
