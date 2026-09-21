"use client";

import Link from "next/link";
import type { Community } from "@/lib/types";
import { members } from "@/lib/mock-data";

export function ChannelSidebar({
  community,
  activeChannelId,
}: {
  community: Community;
  activeChannelId: string;
}) {
  return (
    <aside className="flex w-60 shrink-0 flex-col bg-[var(--bg-app)]">
      <div className="flex h-12 items-center border-b border-[var(--border)] px-4 shadow-sm">
        <h1 className="truncate font-display text-base font-semibold tracking-tight">
          {community.name}
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-3">
        {community.categories.map((category) => (
          <div key={category.id} className="mb-4">
            <div className="mb-1 px-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-dim)]">
              {category.name}
            </div>
            <div className="flex flex-col gap-0.5">
              {category.channels.map((channel) => {
                const active = channel.id === activeChannelId;
                const voiceMembers =
                  channel.type === "voice"
                    ? members.filter((m) => channel.members?.includes(m.id))
                    : [];

                return (
                  <div key={channel.id}>
                    <Link
                      href={`/channels/${community.id}/${channel.id}`}
                      className={`flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm transition-colors ${
                        active
                          ? "bg-[var(--bg-elevated)] text-[var(--text)]"
                          : "text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text)]"
                      }`}
                    >
                      <span className="w-4 text-center text-[var(--text-dim)]">
                        {channel.type === "voice" ? "🔊" : "#"}
                      </span>
                      <span className="truncate">{channel.name}</span>
                    </Link>
                    {voiceMembers.length > 0 && (
                      <div className="ml-6 mt-0.5 flex flex-col gap-0.5">
                        {voiceMembers.map((member) => (
                          <div
                            key={member.id}
                            className="flex items-center gap-2 rounded px-2 py-1 text-xs text-[var(--text-muted)]"
                          >
                            <Avatar name={member.name} size="sm" />
                            <span>{member.name}</span>
                            {member.muted && (
                              <span className="text-[10px] text-[var(--danger)]">음소거</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <UserPanel />
    </aside>
  );
}

function UserPanel() {
  return (
    <div className="flex items-center gap-2 bg-[#16181e] px-2 py-2">
      <Avatar name="You" />
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium">You</div>
        <div className="truncate text-xs text-[var(--text-dim)]">온라인</div>
      </div>
      <div className="flex gap-1">
        <IconButton label="음소거">🎤</IconButton>
        <IconButton label="헤드셋">🎧</IconButton>
        <IconButton label="설정">⚙</IconButton>
      </div>
    </div>
  );
}

function IconButton({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <button
      type="button"
      title={label}
      className="flex h-8 w-8 items-center justify-center rounded text-sm text-[var(--text-muted)] transition hover:bg-[var(--bg-hover)] hover:text-[var(--text)]"
    >
      {children}
    </button>
  );
}

export function Avatar({
  name,
  size = "md",
  color,
}: {
  name: string;
  size?: "sm" | "md";
  color?: string;
}) {
  const dim = size === "sm" ? "h-5 w-5 text-[9px]" : "h-8 w-8 text-xs";
  return (
    <div
      className={`${dim} flex shrink-0 items-center justify-center rounded-full font-semibold text-white`}
      style={{ backgroundColor: color ?? stringToColor(name) }}
    >
      {name.slice(0, 1).toUpperCase()}
    </div>
  );
}

function stringToColor(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  const colors = ["#5865f2", "#3ba55d", "#faa81a", "#ed4245", "#eb459e", "#57f287"];
  return colors[Math.abs(hash) % colors.length];
}
