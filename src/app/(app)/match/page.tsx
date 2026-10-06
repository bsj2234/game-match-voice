"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePreferences } from "@/hooks/usePreferences";
import { useWebPush } from "@/hooks/useWebPush";
import { gameTags, matchRooms } from "@/lib/mock-data";
import { isPreferencesComplete } from "@/lib/preferences";

export default function MatchPage() {
  const { prefs, ready } = usePreferences();
  const push = useWebPush(prefs);
  const [selected, setSelected] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [hydratedFilter, setHydratedFilter] = useState(false);

  useEffect(() => {
    if (!ready || hydratedFilter) return;
    setSelected(prefs?.games?.length ? prefs.games : []);
    setHydratedFilter(true);
  }, [ready, prefs, hydratedFilter]);

  const filterGames = useMemo(() => {
    const merged = [...(prefs?.games ?? []), ...gameTags];
    return [...new Set(merged)];
  }, [prefs?.games]);

  const visibleGames = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return filterGames;
    return filterGames.filter((g) => g.toLowerCase().includes(q));
  }, [filterGames, query]);

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

  const complete = isPreferencesComplete(prefs);

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-5 py-10 md:px-8">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <p className="font-display text-xs font-bold uppercase tracking-[0.22em] text-[var(--signal)]">
            MeltIn
          </p>
          <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight md:text-5xl">
            {prefs?.displayName ? `${prefs.displayName}님, 오늘 뭐 할래?` : "오늘 뭐 할래?"}
          </h1>
          <p className="mt-3 text-[var(--muted)]">
            취향에 맞는 열린 파티를 고르면 음성 로비로 들어갑니다.
          </p>
        </div>
        <Link
          href="/preferences"
          className="shrink-0 border border-[var(--ink)] bg-[var(--ink)] px-5 py-2.5 text-center text-sm font-bold text-white transition hover:bg-[var(--ink-soft)]"
        >
          {complete ? "취향 수정" : "취향 입력하기"}
        </Link>
      </div>

      {!complete && ready && (
        <div className="mb-8 border border-[var(--signal)] bg-[var(--signal-soft)] px-5 py-4">
          <p className="font-display text-base font-bold">먼저 취향을 저장해 주세요</p>
          <p className="mt-1 text-sm text-[var(--muted)]">
            이름·게임·스타일을 입력하면 매칭이 더 잘 맞습니다.
          </p>
          <Link
            href="/preferences"
            className="mt-3 inline-block text-sm font-bold text-[var(--signal-deep)] underline-offset-2 hover:underline"
          >
            취향 입력하러 가기 →
          </Link>
        </div>
      )}

      {complete && prefs && (
        <div className="mb-8 flex flex-wrap gap-2 text-sm">
          <span className="border border-[var(--line)] bg-[var(--surface)] px-3 py-1.5 text-[var(--muted)]">
            마이크 ·{" "}
            {prefs.mic === "ok" ? "가능" : prefs.mic === "required" ? "필수" : "없음"}
          </span>
          {prefs.playstyles.map((s) => (
            <span
              key={s}
              className="border border-[var(--line)] bg-[var(--surface)] px-3 py-1.5 text-[var(--ink-soft)]"
            >
              {s}
            </span>
          ))}
        </div>
      )}

      {complete && push.supported && (
        <section className="mb-10 border border-[var(--line)] bg-[var(--surface)] p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-base font-bold">매칭 대기 · 웹 푸시</h2>
              <p className="mt-1 text-sm text-[var(--muted)]">
                같은 게임을 고른 다른 사람이 대기를 켜면 알림이 갑니다. (서버가 깨어 있을 때)
              </p>
            </div>
            <button
              type="button"
              disabled={push.busy}
              onClick={() => void push.setMatchWaiting(!push.waiting)}
              className={`px-5 py-2.5 text-sm font-bold transition disabled:opacity-40 ${
                push.waiting
                  ? "border border-[var(--signal)] bg-[var(--signal-soft)] text-[var(--signal-deep)]"
                  : "bg-[var(--signal)] text-white hover:bg-[var(--signal-deep)]"
              }`}
            >
              {push.busy
                ? "처리 중…"
                : push.waiting
                  ? "대기 중 · 탭해서 끄기"
                  : "이 취향으로 대기하기"}
            </button>
          </div>
          {push.lastMatch && (
            <p className="mt-3 text-sm font-semibold text-[var(--ok)]">{push.lastMatch}</p>
          )}
          {push.error && (
            <p className="mt-2 text-xs text-[var(--danger)]">{push.error}</p>
          )}
        </section>
      )}

      <section className="mb-10">
        <div className="mb-3 flex items-end justify-between gap-4">
          <h2 className="font-display text-sm font-bold uppercase tracking-[0.16em] text-[var(--ink-soft)]">
            게임 필터
          </h2>
          <button
            type="button"
            onClick={() => setSelected([])}
            className="text-xs font-medium text-[var(--muted)] underline-offset-2 hover:text-[var(--ink)] hover:underline"
          >
            전체 보기
          </button>
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="게임 · 제목 · 태그 검색"
          className="mb-3 w-full border border-[var(--line)] bg-[var(--surface)] px-4 py-2.5 text-sm outline-none transition focus:border-[var(--ink)] sm:max-w-xs"
        />
        <div className="flex flex-wrap gap-2">
          {visibleGames.length === 0 ? (
            <p className="text-sm text-[var(--muted)]">검색 결과가 없습니다.</p>
          ) : (
            visibleGames.map((tag) => {
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
            })
          )}
        </div>
      </section>

      <section>
        <div className="mb-4">
          <h2 className="font-display text-sm font-bold uppercase tracking-[0.16em] text-[var(--ink-soft)]">
            열린 파티
          </h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {rooms.length}개 방 · 클릭하면 음성 로비
            <span className="text-[var(--dim)]"> (목록은 아직 예시 데이터)</span>
          </p>
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
              조건에 맞는 방이 없습니다. 필터를 바꿔보세요.
            </div>
          ) : (
            rooms.map((room) => (
              <Link
                key={room.id}
                href={`/channels/${room.communityId}/${room.channelId}`}
                className="group grid grid-cols-1 gap-3 border-b border-[var(--line)] px-5 py-4 transition last:border-b-0 hover:bg-[var(--signal-soft)] md:grid-cols-[1.4fr_0.7fr_0.5fr_auto] md:items-center md:gap-4"
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
