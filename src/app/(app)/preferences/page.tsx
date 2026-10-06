"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { usePreferences } from "@/hooks/usePreferences";
import { gameTags } from "@/lib/mock-data";
import {
  MIC_OPTIONS,
  PLAYSTYLE_OPTIONS,
  type MicPreference,
  type UserPreferences,
} from "@/lib/preferences";

export default function PreferencesPage() {
  const router = useRouter();
  const { ready, draftDefaults, save, prefs } = usePreferences();
  const [draft, setDraft] = useState<UserPreferences>(draftDefaults);
  const [savedFlash, setSavedFlash] = useState(false);

  useEffect(() => {
    if (ready) setDraft(draftDefaults);
  }, [ready, draftDefaults]);

  function toggleGame(game: string) {
    setDraft((prev) => ({
      ...prev,
      games: prev.games.includes(game)
        ? prev.games.filter((g) => g !== game)
        : [...prev.games, game],
    }));
  }

  function togglePlaystyle(style: string) {
    setDraft((prev) => ({
      ...prev,
      playstyles: prev.playstyles.includes(style)
        ? prev.playstyles.filter((s) => s !== style)
        : [...prev.playstyles, style],
    }));
  }

  function handleSave() {
    if (draft.games.length === 0) return;
    save(draft);
    setSavedFlash(true);
    window.setTimeout(() => {
      router.push("/match");
    }, 400);
  }

  const canSave = draft.games.length > 0 && draft.displayName.trim().length > 0;

  if (!ready) {
    return (
      <div className="mx-auto w-full max-w-2xl flex-1 px-5 py-16 text-[var(--muted)] md:px-8">
        불러오는 중…
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-5 py-10 md:px-8">
      <div className="mb-10">
        <p className="font-display text-xs font-bold uppercase tracking-[0.22em] text-[var(--signal)]">
          Preferences
        </p>
        <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight">
          내 취향 입력
        </h1>
        <p className="mt-3 text-[var(--muted)]">
          한 번 저장해 두면 매칭 보드가 이 취향에 맞춰 열립니다. (이 기기 브라우저에 저장)
        </p>
        {prefs?.updatedAt && (
          <p className="mt-2 text-xs text-[var(--dim)]">
            마지막 저장 · {new Date(prefs.updatedAt).toLocaleString("ko-KR")}
          </p>
        )}
      </div>

      <section className="mb-8 border border-[var(--line)] bg-[var(--surface)] p-5">
        <h2 className="font-display text-sm font-bold uppercase tracking-[0.14em] text-[var(--ink-soft)]">
          1. 표시 이름
        </h2>
        <p className="mt-1 text-sm text-[var(--muted)]">음성 로비에서 보이는 이름</p>
        <input
          value={draft.displayName}
          onChange={(e) => setDraft((p) => ({ ...p, displayName: e.target.value }))}
          placeholder="예: Nova"
          maxLength={24}
          className="mt-4 w-full border border-[var(--line)] bg-[var(--paper-2)] px-4 py-3 text-sm outline-none focus:border-[var(--ink)]"
        />
      </section>

      <section className="mb-8 border border-[var(--line)] bg-[var(--surface)] p-5">
        <h2 className="font-display text-sm font-bold uppercase tracking-[0.14em] text-[var(--ink-soft)]">
          2. 하는 게임
        </h2>
        <p className="mt-1 text-sm text-[var(--muted)]">하나 이상 골라 주세요</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {gameTags.map((game) => {
            const active = draft.games.includes(game);
            return (
              <button
                key={game}
                type="button"
                onClick={() => toggleGame(game)}
                className={`border px-4 py-2 text-sm font-semibold transition ${
                  active
                    ? "border-[var(--signal)] bg-[var(--signal)] text-white"
                    : "border-[var(--line)] bg-[var(--paper-2)] text-[var(--ink-soft)] hover:border-[var(--ink)]"
                }`}
              >
                {game}
              </button>
            );
          })}
        </div>
      </section>

      <section className="mb-8 border border-[var(--line)] bg-[var(--surface)] p-5">
        <h2 className="font-display text-sm font-bold uppercase tracking-[0.14em] text-[var(--ink-soft)]">
          3. 플레이 스타일
        </h2>
        <p className="mt-1 text-sm text-[var(--muted)]">선택 · 여러 개 가능</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {PLAYSTYLE_OPTIONS.map((style) => {
            const active = draft.playstyles.includes(style);
            return (
              <button
                key={style}
                type="button"
                onClick={() => togglePlaystyle(style)}
                className={`border px-4 py-2 text-sm font-semibold transition ${
                  active
                    ? "border-[var(--ink)] bg-[var(--ink)] text-white"
                    : "border-[var(--line)] bg-[var(--paper-2)] text-[var(--ink-soft)] hover:border-[var(--ink)]"
                }`}
              >
                {style}
              </button>
            );
          })}
        </div>
      </section>

      <section className="mb-10 border border-[var(--line)] bg-[var(--surface)] p-5">
        <h2 className="font-display text-sm font-bold uppercase tracking-[0.14em] text-[var(--ink-soft)]">
          4. 마이크
        </h2>
        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          {MIC_OPTIONS.map((opt) => {
            const active = draft.mic === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setDraft((p) => ({ ...p, mic: opt.value as MicPreference }))}
                className={`border px-4 py-3 text-left transition ${
                  active
                    ? "border-[var(--signal)] bg-[var(--signal-soft)]"
                    : "border-[var(--line)] bg-[var(--paper-2)] hover:border-[var(--ink)]"
                }`}
              >
                <div className="text-sm font-bold">{opt.label}</div>
                <div className="mt-0.5 text-xs text-[var(--muted)]">{opt.hint}</div>
              </button>
            );
          })}
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={!canSave}
          className="bg-[var(--signal)] px-8 py-3 text-sm font-bold text-white transition hover:bg-[var(--signal-deep)] disabled:opacity-40"
        >
          {savedFlash ? "저장됨!" : "저장하고 매칭으로"}
        </button>
        <Link
          href="/match"
          className="px-4 py-3 text-sm font-semibold text-[var(--muted)] transition hover:text-[var(--ink)]"
        >
          나중에
        </Link>
      </div>
      {!canSave && (
        <p className="mt-3 text-xs text-[var(--danger)]">
          이름과 게임을 하나 이상 입력해 주세요.
        </p>
      )}
    </div>
  );
}
