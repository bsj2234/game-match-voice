import { ServerRail } from "@/components/ServerRail";

export default function AppShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg-deep)]">
      <ServerRail />
      {children}
    </div>
  );
}
