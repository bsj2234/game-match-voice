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
        selected.length === 0 ||
        selected.some((g) => room.game === g || room.tags.includes(g));
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
    <div className="mx-auto w-full max-w-6xl flex-1 px-5 py-10 md:px-8">
      <div className="mb-10 max-w-2xl">
        <p className="font-display text-xs font-bold uppercase tracking-[0.22em] text-[var(--signal)]">
          MeltIn
        </p>
        <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight md:text-5xl">
          오늘 뭐 할래?
        </h1>
        <p className="mt-3 text-[var(--muted)]">
          게임을 고르면 열린 파티가 보여요. 고르면 음성 로비로 바로 들어갑니다.
        </p>
      </div>

      <section className="mb-10">
        <div className="mb-3 flex items-end justify-between gap-4">
          <h2 className="font-display text-sm font-bold uppercase tracking-[0.16em] text-[var(--ink-soft)]">
            1. 취향 선택
          </h2>
          <button
            type="button"
            onClick={() => setSelected([])}
            className="text-xs font-medium text-[var(--muted)] underline-offset-2 hover:text-[var(--ink)] hover:underline"
          >
            전체 보기
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {gameTags.map((tag) => {
            const active = selected.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => toggle(tag)}
                className={`border px-4 py-2 text-sm font-semibold transition ${
                  active
                    ? "border-[var(--signal)] bg-[var(--signal)] text-white"
                    : "border-[var(--line)] bg-[var(--surface)] text-[var(--ink-soft)] hover:border-[var(--ink)]"
                }`}
              >
                {tag}
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-display text-sm font-bold uppercase tracking-[0.16em] text-[var(--ink-soft)]">
              2. 열린 파티
            </h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              {rooms.length}개 방 · 클릭하면 음성 로비
            </p>
          </div>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="제목 · 태그 검색"
            className="w-full border border-[var(--line)] bg-[var(--surface)] px-4 py-2.5 text-sm outline-none transition focus:border-[var(--ink)] sm:max-w-xs"
          />
        </div>

        <div className="overflow-hidden border border-[var(--line)] bg-[var(--surface)]">
          <div className="hidden grid-cols-[1.4fr_0.7fr_0.5fr_auto] gap-4 border-b border-[var(--line)] bg-[var(--paper-2)] px-5 py-3 text-xs font-bold uppercase tracking-[0.14em] text-[var(--dim)] md:grid">
            <span>파티</span>
            <span>게임</span>
            <span>인원</span>
            <span />
          </div>

          {rooms.length === 0 ? (
            <div className="px-5 py-16 text-center text-[var(--muted)]">
              조건에 맞는 방이 없습니다. 취향을 바꿔보세요.
            </div>
          ) : (
            rooms.map((room, i) => (
              <Link
                key={room.id}
                href={`/channels/${room.communityId}/${room.channelId}`}
                className="group grid grid-cols-1 gap-3 border-b border-[var(--line)] px-5 py-4 transition last:border-b-0 hover:bg-[var(--signal-soft)] md:grid-cols-[1.4fr_0.7fr_0.5fr_auto] md:items-center md:gap-4"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <div>
                  <div className="font-display text-lg font-bold tracking-tight group-hover:text-[var(--signal-deep)]">
                    {room.title}
                  </div>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {room.tags.map((tag) => (
                      <span
                        key={tag}
                        className="border border-[var(--line)] px-2 py-0.5 text-[11px] font-medium text-[var(--muted)]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-sm font-semibold text-[var(--ink-soft)]">{room.game}</div>
                <div className="text-sm tabular-nums text-[var(--muted)]">
                  <span className="font-bold text-[var(--ink)]">{room.players}</span>
                  <span> / {room.maxPlayers}</span>
                </div>
                <div className="text-sm font-bold text-[var(--signal)] transition group-hover:translate-x-0.5">
                  참가 →
                </div>
              </Link>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
