import Link from "next/link";

export default function HomePage() {
  return (
    <div className="relative min-h-full overflow-hidden bg-[var(--ink)] text-[var(--paper-2)]">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 78% 18%, rgba(255,74,28,0.35), transparent 55%), radial-gradient(ellipse 45% 40% at 12% 88%, rgba(15,159,110,0.18), transparent 50%), linear-gradient(165deg, #07131f 0%, #0b1c2c 48%, #102536 100%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "repeating-linear-gradient(-12deg, transparent, transparent 18px, rgba(255,255,255,0.03) 18px, rgba(255,255,255,0.03) 19px)",
        }}
      />
      <div
        className="pointer-events-none absolute -right-24 top-24 h-[70vh] w-[70vh] rounded-full opacity-30"
        style={{
          background:
            "conic-gradient(from 210deg, transparent, rgba(255,74,28,0.5), transparent 40%)",
          filter: "blur(2px)",
        }}
      />

      <div className="relative z-10 border-b border-white/10">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5 md:px-8">
          <div className="font-display text-lg font-extrabold tracking-tight">
            Melt<span className="text-[var(--signal)]">In</span>
          </div>
          <Link
            href="/match"
            className="bg-[var(--signal)] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[var(--signal-deep)]"
          >
            파티 찾기
          </Link>
        </div>
      </div>

      <main className="relative z-10 mx-auto flex min-h-[calc(100vh-56px)] max-w-6xl flex-col justify-center px-5 pb-24 pt-16 md:px-8">
        <p className="anim-rise mb-5 font-display text-sm font-semibold uppercase tracking-[0.28em] text-[var(--signal)]">
          MeltIn
        </p>
        <h1 className="anim-rise-delay max-w-4xl font-display text-5xl font-extrabold leading-[0.98] tracking-tight md:text-7xl lg:text-8xl">
          맞는 로비에
          <br />
          녹아든다
        </h1>
        <div className="anim-underline mt-5 h-1 w-28 bg-[var(--signal)]" />
        <p className="anim-rise-delay-2 mt-7 max-w-lg text-lg leading-relaxed text-white/70">
          게임 취향으로 매칭하고, 맞으면 음성 로비로 자연스럽게 들어갑니다.
        </p>
        <div className="anim-rise-delay-2 mt-10 flex flex-wrap gap-3">
          <Link
            href="/match"
            className="bg-[var(--signal)] px-8 py-3.5 text-sm font-bold text-white transition hover:bg-[var(--signal-deep)]"
          >
            매칭 시작
          </Link>
          <Link
            href="/match"
            className="border border-white/25 bg-white/5 px-8 py-3.5 text-sm font-semibold text-white/90 backdrop-blur transition hover:border-white/50 hover:bg-white/10"
          >
            열린 방 보기
          </Link>
        </div>

        <div className="anim-rise-delay-2 mt-16 flex items-center gap-6 text-sm text-white/45">
          <span className="flex items-center gap-2">
            <span className="anim-slot inline-block h-2 w-2 bg-[var(--signal)]" />
            실시간 매칭 보드
          </span>
          <span className="hidden h-3 w-px bg-white/20 sm:block" />
          <span className="hidden sm:inline">취향 고르고 · 방 들어가고 · 바로 통화</span>
        </div>
      </main>
    </div>
  );
}
