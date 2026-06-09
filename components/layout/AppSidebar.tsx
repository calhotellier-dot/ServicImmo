"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboardIcon,
  FolderOpenIcon,
  UsersIcon,
  CalendarIcon,
  FileTextIcon,
  BarChart3Icon,
  SettingsIcon,
} from "lucide-react";

const NAV = [
  { href: "/app", label: "Dashboard", icon: LayoutDashboardIcon },
  { href: "/app/dossiers", label: "Dossiers", icon: FolderOpenIcon },
  { href: "/app/contacts", label: "Contacts", icon: UsersIcon },
  { href: "/app/agenda", label: "Agenda", icon: CalendarIcon },
  { href: "/app/facturation", label: "Facturation", icon: FileTextIcon },
  { href: "/app/statistiques", label: "Statistiques", icon: BarChart3Icon },
  { href: "/app/parametres", label: "Paramètres", icon: SettingsIcon },
] as const;

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-56 flex-col border-r border-neutral-200 bg-white">
      <div className="flex h-14 items-center px-5">
        <Link href="/app" className="text-sm font-semibold tracking-tight">
          Servicimmo · Pilote
        </Link>
      </div>
      <nav className="flex flex-1 flex-col gap-0.5 px-2 py-3">
        {NAV.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/app" && pathname.startsWith(`${item.href}/`));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-neutral-900 text-white"
                  : "text-neutral-700 hover:bg-neutral-100",
              ].join(" ")}
            >
              <Icon className="h-4 w-4" aria-hidden />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-neutral-200 px-3 py-3 font-mono text-[10px] tracking-widest text-neutral-400">
        SPRINT 1 · AUTH + CONTACTS
      </div>
    </aside>
  );
}
