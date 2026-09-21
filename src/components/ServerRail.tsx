"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { communities } from "@/lib/mock-data";

export function ServerRail() {
  const pathname = usePathname();

  return (
    <aside className="flex w-[72px] shrink-0 flex-col items-center gap-2 bg-[var(--bg-deep)] py-3">
      <Link
        href="/match"
        className={`group relative flex h-12 w-12 items-center justify-center rounded-[16px] transition-all duration-200 hover:rounded-[14px] ${
          pathname.startsWith("/match")
            ? "rounded-[14px] bg-[var(--accent)] text-[var(--bg-deep)]"
            : "bg-[var(--bg-panel)] text-[var(--accent)] hover:bg-[var(--accent)] hover:text-[var(--bg-deep)]"
        }`}
        title="매칭"
      >
        <span className="font-display text-lg font-bold">GM</span>
        <RailIndicator active={pathname.startsWith("/match")} />
      </Link>

      <div className="my-1 h-0.5 w-8 rounded-full bg-[var(--border)]" />

      {communities.map((community) => {
        const href = `/channels/${community.id}`;
        const active = pathname.startsWith(href);
        return (
          <Link
            key={community.id}
            href={`${href}/${community.categories[0].channels[0].id}`}
            className={`group relative flex h-12 w-12 items-center justify-center rounded-[16px] text-sm font-bold transition-all duration-200 hover:rounded-[14px] ${
              active ? "rounded-[14px] text-white" : "bg-[var(--bg-panel)] text-[var(--text)] hover:text-white"
            }`}
            style={
              active
                ? { backgroundColor: community.color }
                : undefined
            }
            title={community.name}
          >
            {!active && (
              <span
                className="absolute inset-0 rounded-[16px] opacity-0 transition group-hover:opacity-100 group-hover:rounded-[14px]"
                style={{ backgroundColor: community.color }}
              />
            )}
            <span className="relative z-10">{community.short}</span>
            <RailIndicator active={active} />
          </Link>
        );
      })}

      <button
        type="button"
        className="mt-1 flex h-12 w-12 items-center justify-center rounded-[16px] bg-[var(--bg-panel)] text-2xl text-[var(--accent)] transition-all duration-200 hover:rounded-[14px] hover:bg-[var(--accent-soft)]"
        title="커뮤니티 추가"
      >
        +
      </button>
    </aside>
  );
}

function RailIndicator({ active }: { active: boolean }) {
  return (
    <span
      className={`absolute left-0 top-1/2 h-2 w-1 -translate-y-1/2 rounded-r-full bg-white transition-all duration-200 ${
        active ? "h-10 opacity-100" : "opacity-0 group-hover:h-5 group-hover:opacity-100"
      }`}
    />
  );
}
