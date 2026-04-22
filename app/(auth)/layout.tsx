import type { ReactNode } from "react";

/**
 * Layout du groupe (auth) — login, reset password, magic link.
 * Stub Sprint 0, auth réelle en Sprint 1 (F-02).
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
