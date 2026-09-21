"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { gameTags, matchRooms } from "@/lib/mock-data";

export default function MatchPage() {
  const [selected, setSelected] = useState<string[]>(["Valorant"]);
  const [query, setQuery] = useState("");

  const rooms = useMemo(() => {
    return matchRooms.filter((room) => {
      const gameOk =
        selected.length === 0 || selected.some((g) => room.game === g || room.tags.includes(g));
      const q = query.trim().toLowerCase();
      const queryOk =
        !q ||
        room.title.toLowerCase().includes(q) ||
        room.game.toLowerCase().includes(q) ||
        room.tags.some((t) => t.toLowerCase().includes(q));
      return gameOk && queryOk;
    });
  }, [selected, query]);

  function toggle(tag: string) {
    setSelected((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  }

  return (
    <div className="flex min-w-0 flex-1 flex-col bg-[var(--bg-panel)]">
      <header className="border-b border-[var(--border)] px-6 py-5">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
          Match
        </p>
        <h1 className="mt-1 font-display text-2xl font-bold">게임 취향으로 방 찾기</h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          원하는 게임을 고르면 커뮤니티 음성방으로 바로 연결됩니다.
        </p>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="mb-6">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="방 제목, 태그 검색..."
            className="w-full max-w-xl rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-3 text-sm outline-none transition focus:border-[var(--accent)]"
          />
        </div>

        <div className="mb-8 flex flex-wrap gap-2">
          {gameTags.map((tag) => {
            const active = selected.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => toggle(tag)}
                className={`rounded-full px-4 py-1.5 text-sm transition ${
                  active
                    ? "bg-[var(--accent)] font-semibold text-[var(--bg-deep)]"
                    : "bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:text-[var(--text)]"
                }`}
              >
                {tag}
              </button>
            );
          })}
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {rooms.map((room) => (
            <Link
              key={room.id}
              href={`/channels/${room.communityId}/${room.channelId}`}
              className="group rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] p-5 transition hover:border-[var(--accent)]/60 hover:bg-[var(--bg-hover)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-medium text-[var(--accent)]">{room.game}</div>
                  <h2 className="mt-1 font-display text-lg font-semibold">{room.title}</h2>
                </div>
                <div className="rounded-full bg-[var(--bg-app)] px-2.5 py-1 text-xs text-[var(--text-muted)]">
                  {room.players}/{room.maxPlayers}
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {room.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md bg-[var(--bg-app)] px-2 py-0.5 text-xs text-[var(--text-dim)]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className="mt-5 text-sm font-medium text-[var(--accent)] opacity-80 transition group-hover:opacity-100">
                음성방 참가 →
              </div>
            </Link>
          ))}
          {rooms.length === 0 && (
            <div className="col-span-full rounded-2xl border border-dashed border-[var(--border)] px-6 py-16 text-center text-[var(--text-muted)]">
              조건에 맞는 방이 없습니다. 태그를 바꿔보세요.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
