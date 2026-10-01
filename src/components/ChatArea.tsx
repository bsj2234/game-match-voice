import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import { VoiceRoom } from "@/components/VoiceRoom";
import { getMember, getMessages } from "@/lib/mock-data";
import type { Channel, Community } from "@/lib/types";

export function ChatArea({
  community,
  channel,
}: {
  community: Community;
  channel: Channel;
}) {
  if (channel.type === "voice") {
    return <VoiceRoom community={community} channel={channel} />;
  }

  const messages = getMessages(community.id, channel.id);

  return (
    <section className="flex min-h-[70vh] flex-1 flex-col border border-[var(--line)] bg-[var(--surface)]">
      <header className="flex items-center gap-3 border-b border-[var(--line)] px-5 py-4">
        <Link
          href="/match"
          className="text-sm font-medium text-[var(--muted)] transition hover:text-[var(--ink)]"
        >
          ← 매칭
        </Link>
        <span className="text-[var(--line)]">/</span>
        <div>
          <h2 className="font-display text-lg font-bold">#{channel.name}</h2>
          {channel.topic && (
            <p className="text-xs text-[var(--muted)]">{channel.topic}</p>
          )}
        </div>
      </header>

      <div className="flex-1 space-y-4 overflow-y-auto px-5 py-6">
        {messages.length === 0 ? (
          <div className="text-[var(--muted)]">아직 메시지가 없습니다.</div>
        ) : (
          messages.map((message) => {
            const author = getMember(message.authorId);
            return (
              <div key={message.id} className="flex gap-3">
                <Avatar name={author?.name ?? "?"} />
                <div className="min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-bold">{author?.name ?? "Unknown"}</span>
                    <span className="text-xs text-[var(--dim)]">{message.timestamp}</span>
                  </div>
                  <p className="mt-0.5 text-[15px] leading-relaxed text-[var(--ink-soft)]">
                    {message.content}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="border-t border-[var(--line)] px-5 py-4">
        <input
          className="w-full border border-[var(--line)] bg-[var(--paper-2)] px-4 py-3 text-sm outline-none"
          placeholder={`#${channel.name}에 메시지 보내기`}
          disabled
        />
      </div>
    </section>
  );
}
