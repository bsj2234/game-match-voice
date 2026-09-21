import Link from "next/link";
import { communities } from "@/lib/mock-data";

export default function HomePage() {
  return (
    <div className="relative min-h-full overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 70% 20%, rgba(45,212,168,0.18), transparent 55%), radial-gradient(ellipse 50% 40% at 10% 80%, rgba(88,101,242,0.12), transparent 50%), linear-gradient(160deg, #0e0f12 0%, #151821 45%, #0e0f12 100%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(ellipse at center, black 20%, transparent 75%)",
        }}
      />

      <header className="relative z-10 flex items-center justify-between px-6 py-5 md:px-10">
        <div className="font-display text-xl font-bold tracking-tight">
          <span className="text-[var(--accent)]">Game</span>Match Voice
        </div>
        <nav className="flex items-center gap-3">
          <Link
            href="/match"
            className="rounded-full px-4 py-2 text-sm text-[var(--text-muted)] transition hover:text-[var(--text)]"
          >
            매칭
          </Link>
          <Link
            href={`/channels/${communities[0].id}/general`}
            className="rounded-full bg-[var(--accent)] px-5 py-2 text-sm font-semibold text-[var(--bg-deep)] transition hover:bg-[var(--accent-strong)]"
          >
            앱 열기
          </Link>
        </nav>
      </header>

      <main className="relative z-10 mx-auto flex min-h-[calc(100vh-80px)] max-w-6xl flex-col justify-center px-6 pb-20 pt-8 md:px-10">
        <p className="mb-4 text-sm font-medium uppercase tracking-[0.25em] text-[var(--accent)]">
          Community + Voice
        </p>
        <h1 className="max-w-3xl font-display text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl">
          취향 맞는 사람들과
          <br />
          <span className="text-[var(--accent)]">바로 통화</span>하세요
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-[var(--text-muted)]">
          Discord처럼 커뮤니티·채널·음성방을 쓰고, 게임 취향으로 파티를 찾는 웹 보이스
          커뮤니티입니다.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href={`/channels/${communities[0].id}/lobby`}
            className="rounded-full bg-[var(--accent)] px-8 py-3.5 text-sm font-semibold text-[var(--bg-deep)] transition hover:bg-[var(--accent-strong)]"
          >
            음성 로비 들어가기
          </Link>
          <Link
            href="/match"
            className="rounded-full border border-[var(--border)] bg-[var(--bg-panel)]/60 px-8 py-3.5 text-sm font-semibold text-[var(--text)] backdrop-blur transition hover:border-[var(--accent)] hover:bg-[var(--accent-soft)]"
          >
            게임으로 방 찾기
          </Link>
        </div>

        <div className="mt-16 grid gap-4 sm:grid-cols-3">
          {communities.map((c) => (
            <Link
              key={c.id}
              href={`/channels/${c.id}/${c.categories[0].channels[0].id}`}
              className="group rounded-2xl border border-[var(--border)] bg-[var(--bg-panel)]/50 p-5 backdrop-blur transition hover:border-[var(--accent)]/50 hover:bg-[var(--bg-elevated)]/70"
            >
              <div
                className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold text-white"
                style={{ backgroundColor: c.color }}
              >
                {c.short}
              </div>
              <div className="font-display text-lg font-semibold">{c.name}</div>
              <p className="mt-1 text-sm text-[var(--text-muted)]">{c.description}</p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
