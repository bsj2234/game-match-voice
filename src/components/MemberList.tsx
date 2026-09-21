import { members } from "@/lib/mock-data";
import { Avatar } from "./ChannelSidebar";

const statusColor = {
  online: "var(--online)",
  idle: "var(--idle)",
  dnd: "var(--dnd)",
  offline: "var(--offline)",
} as const;

const statusLabel = {
  online: "온라인",
  idle: "자리 비움",
  dnd: "방해 금지",
  offline: "오프라인",
} as const;

export function MemberList() {
  const online = members.filter((m) => m.status !== "offline");
  const offline = members.filter((m) => m.status === "offline");

  return (
    <aside className="hidden w-60 shrink-0 flex-col bg-[var(--bg-app)] lg:flex">
      <div className="flex-1 overflow-y-auto px-3 py-4">
        <Group title={`온라인 — ${online.length}`}>
          {online.map((member) => (
            <MemberRow key={member.id} {...member} />
          ))}
        </Group>
        <Group title={`오프라인 — ${offline.length}`}>
          {offline.map((member) => (
            <MemberRow key={member.id} {...member} />
          ))}
        </Group>
      </div>
    </aside>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <div className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-dim)]">
        {title}
      </div>
      <div className="flex flex-col gap-0.5">{children}</div>
    </div>
  );
}

function MemberRow({
  name,
  status,
  games,
  inVoice,
}: {
  name: string;
  status: keyof typeof statusColor;
  games: string[];
  inVoice?: boolean;
}) {
  return (
    <div className="flex items-center gap-2 rounded-md px-2 py-1.5 transition hover:bg-[var(--bg-hover)]">
      <div className="relative">
        <Avatar name={name} />
        <span
          className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[var(--bg-app)]"
          style={{ backgroundColor: statusColor[status] }}
          title={statusLabel[status]}
        />
      </div>
      <div className="min-w-0">
        <div className="truncate text-sm font-medium">{name}</div>
        <div className="truncate text-xs text-[var(--text-dim)]">
          {inVoice ? "음성 채널" : games[0] ?? statusLabel[status]}
        </div>
      </div>
    </div>
  );
}
