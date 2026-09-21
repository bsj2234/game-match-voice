import { getMember, getMessages } from "@/lib/mock-data";
import type { Channel, Community } from "@/lib/types";
import { Avatar } from "./ChannelSidebar";

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
    <section className="flex min-w-0 flex-1 flex-col bg-[var(--bg-panel)]">
      <header className="flex h-12 items-center gap-2 border-b border-[var(--border)] px-4 shadow-sm">
        <span className="text-[var(--text-dim)]">#</span>
        <h2 className="font-display text-base font-semibold">{channel.name}</h2>
        {channel.topic && (
          <>
            <span className="mx-2 h-4 w-px bg-[var(--border)]" />
            <p className="truncate text-sm text-[var(--text-muted)]">{channel.topic}</p>
          </>
        )}
      </header>

      <div className="flex-1 space-y-4 overflow-y-auto px-4 py-6">
        {messages.length === 0 ? (
          <EmptyChannel name={channel.name} />
        ) : (
          messages.map((message) => {
            const author = getMember(message.authorId);
            return (
              <div key={message.id} className="flex gap-3 hover:bg-[var(--bg-elevated)]/40 rounded-md px-2 py-1 -mx-2">
                <Avatar name={author?.name ?? "?"} />
                <div className="min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-semibold">{author?.name ?? "Unknown"}</span>
                    <span className="text-xs text-[var(--text-dim)]">{message.timestamp}</span>
                  </div>
                  <p className="mt-0.5 text-[15px] leading-relaxed text-[var(--text)]">
                    {message.content}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="px-4 pb-4">
        <div className="flex items-center rounded-lg bg-[var(--bg-elevated)] px-4 py-3">
          <input
            className="w-full bg-transparent text-sm outline-none placeholder:text-[var(--text-dim)]"
            placeholder={`#${channel.name}에 메시지 보내기`}
            disabled
          />
        </div>
        <p className="mt-2 text-center text-[11px] text-[var(--text-dim)]">
          데모 UI · 실시간 채팅은 다음 단계에서 연결합니다
        </p>
      </div>
    </section>
  );
}

function EmptyChannel({ name }: { name: string }) {
  return (
    <div className="flex h-full flex-col justify-end pb-4">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--bg-elevated)] text-3xl text-[var(--text-dim)]">
        #
      </div>
      <h3 className="font-display text-2xl font-bold">#{name}에 오신 것을 환영합니다!</h3>
      <p className="mt-1 text-[var(--text-muted)]">이 채널의 시작입니다.</p>
    </div>
  );
}

function VoiceRoom({
  community,
  channel,
}: {
  community: Community;
  channel: Channel;
}) {
  const joined = (channel.members ?? [])
    .map((id) => ({ id }))
    .map(({ id }) => getMember(id))
    .filter(Boolean);

  return (
    <section className="flex min-w-0 flex-1 flex-col bg-[var(--bg-panel)]">
      <header className="flex h-12 items-center gap-2 border-b border-[var(--border)] px-4 shadow-sm">
        <span className="text-[var(--text-dim)]">🔊</span>
        <h2 className="font-display text-base font-semibold">{channel.name}</h2>
        <span className="mx-2 h-4 w-px bg-[var(--border)]" />
        <p className="text-sm text-[var(--text-muted)]">
          {community.name} · 음성 채널
        </p>
      </header>

      <div className="flex flex-1 flex-col items-center justify-center gap-8 px-6">
        <div className="text-center">
          <p className="text-sm uppercase tracking-[0.2em] text-[var(--text-dim)]">Voice</p>
          <h3 className="mt-2 font-display text-3xl font-bold">{channel.name}</h3>
          <p className="mt-2 max-w-md text-[var(--text-muted)]">
            Discord처럼 방에 들어가면 바로 통화합니다. WebRTC 연결은 이후 LiveKit 등으로 붙일 예정입니다.
          </p>
        </div>

        <div className="grid w-full max-w-2xl grid-cols-2 gap-4 sm:grid-cols-3">
          {joined.length > 0 ? (
            joined.map((member) =>
              member ? (
                <div
                  key={member.id}
                  className="flex flex-col items-center gap-3 rounded-2xl bg-[var(--bg-elevated)] p-6"
                >
                  <div className="relative">
                    <Avatar name={member.name} />
                    <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[var(--bg-elevated)] bg-[var(--online)]" />
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium">{member.name}</div>
                    <div className="text-xs text-[var(--text-dim)]">
                      {member.muted ? "음소거됨" : "말하는 중"}
                    </div>
                  </div>
                </div>
              ) : null,
            )
          ) : (
            <div className="col-span-full rounded-2xl border border-dashed border-[var(--border)] px-6 py-12 text-center text-[var(--text-muted)]">
              아직 아무도 없어요. 참가하면 여기에 표시됩니다.
            </div>
          )}
        </div>

        <button
          type="button"
          className="rounded-full bg-[var(--accent)] px-8 py-3 text-sm font-semibold text-[var(--bg-deep)] transition hover:bg-[var(--accent-strong)]"
        >
          음성 채널 참가
        </button>
      </div>
    </section>
  );
}
