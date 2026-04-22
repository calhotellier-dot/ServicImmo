import type { ReactNode } from "react";

import { AppHeader } from "@/components/layout/AppHeader";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { getCurrentUser } from "@/lib/features/auth/session";

/**
 * Layout du groupe (app).
 *
 * Sprint 1 : sidebar + header + récupération du profil utilisateur.
 * Le middleware a déjà redirigé les non-connectés vers /login, donc si on
 * arrive ici et que `getCurrentUser()` renvoie null, c'est que l'env Supabase
 * n'est pas provisionné → on affiche quand même l'UI en mode "démo".
 */
export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();

  return (
    <div className="flex h-screen bg-neutral-50 text-neutral-900">
      <AppSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AppHeader
          userEmail={user?.email ?? null}
          userName={
            user
              ? [user.profile.first_name, user.profile.last_name]
                  .filter(Boolean)
                  .join(" ") || null
              : null
          }
          role={user?.profile.role ?? null}
        />
        <main className="flex-1 overflow-auto px-8 py-6">{children}</main>
      </div>
    </div>
  );
}
