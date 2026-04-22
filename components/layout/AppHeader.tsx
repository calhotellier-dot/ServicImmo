import { LogOutIcon } from "lucide-react";

import { signOut } from "@/lib/features/auth/actions";

type AppHeaderProps = {
  userEmail: string | null;
  userName: string | null;
  role: string | null;
};

export function AppHeader({ userEmail, userName, role }: AppHeaderProps) {
  const display = userName ?? userEmail ?? "Utilisateur";
  return (
    <header className="flex h-14 items-center justify-end gap-4 border-b border-neutral-200 bg-white px-6">
      <div className="flex items-center gap-3">
        <div className="text-right">
          <div className="text-sm font-medium text-neutral-900">{display}</div>
          {role ? (
            <div className="font-mono text-[10px] tracking-widest text-neutral-400">
              {role.toUpperCase()}
            </div>
          ) : null}
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-900 text-xs font-medium text-white">
          {display.charAt(0).toUpperCase()}
        </div>
        <form action={signOut}>
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-[12px] text-neutral-700 hover:border-neutral-400"
            aria-label="Se déconnecter"
          >
            <LogOutIcon className="h-3.5 w-3.5" aria-hidden />
            Déconnexion
          </button>
        </form>
      </div>
    </header>
  );
}
