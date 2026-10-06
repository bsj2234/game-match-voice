"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function MatchNav() {
  const pathname = usePathname();
  const onLobby = pathname.startsWith("/channels");
  const onMatch = pathname.startsWith("/match");
  const onPrefs = pathname.startsWith("/preferences");

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[var(--paper)]/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5 md:px-8">
        <Link href="/" className="font-display text-lg font-extrabold tracking-tight">
          Melt<span className="text-[var(--signal)]">In</span>
        </Link>
        <nav className="flex items-center gap-5 text-sm font-semibold sm:gap-6">
          <NavLink href="/preferences" active={onPrefs}>
            취향
          </NavLink>
          <NavLink href="/match" active={onMatch}>
            매칭
          </NavLink>
          <span
            className={`relative pb-1 ${
              onLobby ? "text-[var(--ink)]" : "text-[var(--dim)]"
            }`}
          >
            로비
            {onLobby && (
              <span className="absolute inset-x-0 -bottom-0.5 h-0.5 bg-[var(--signal)]" />
            )}
          </span>
        </nav>
      </div>
    </header>
  );
}

function NavLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`relative pb-1 transition ${
        active ? "text-[var(--ink)]" : "text-[var(--muted)] hover:text-[var(--ink)]"
      }`}
    >
      {children}
      {active && <span className="absolute inset-x-0 -bottom-0.5 h-0.5 bg-[var(--signal)]" />}
    </Link>
  );
}
