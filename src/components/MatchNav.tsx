"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function MatchNav() {
  const pathname = usePathname();
  const onLobby = pathname.startsWith("/channels");
  const onMatch = pathname.startsWith("/match");

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[var(--paper)]/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5 md:px-8">
        <Link href="/" className="font-display text-lg font-extrabold tracking-tight">
          Melt<span className="text-[var(--signal)]">In</span>
        </Link>
        <nav className="flex items-center gap-6 text-sm font-semibold">
          <Link
            href="/match"
            className={`relative pb-1 transition ${
              onMatch ? "text-[var(--ink)]" : "text-[var(--muted)] hover:text-[var(--ink)]"
            }`}
          >
            매칭
            {onMatch && (
              <span className="absolute inset-x-0 -bottom-0.5 h-0.5 bg-[var(--signal)]" />
            )}
          </Link>
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
