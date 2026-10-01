import { MatchNav } from "@/components/MatchNav";

export default function AppShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--paper)]">
      <MatchNav />
      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
}
