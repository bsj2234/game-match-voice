"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Avatar } from "@/components/Avatar";
import { RemoteAudio } from "@/components/RemoteAudio";
import { formatDuration, useVoiceRecorder } from "@/hooks/useVoiceRecorder";
import { useVoiceRoom } from "@/hooks/useVoiceRoom";
import type { Channel, Community } from "@/lib/types";

function loadName() {
  if (typeof window === "undefined") return "Guest";
  return localStorage.getItem("gmv-display-name") || "Guest";
}

export function VoiceRoom({
  community,
  channel,
}: {
  community: Community;
  channel: Channel;
}) {
  const roomId = `${community.id}:${channel.id}`;
  const [name, setName] = useState(loadName);
  const [nameDraft, setNameDraft] = useState(loadName);

  const voice = useVoiceRoom({ roomId, displayName: name });
  const recorder = useVoiceRecorder();

  const recordStreams = useMemo(() => {
    const streams: MediaStream[] = [];
    if (voice.localStream) streams.push(voice.localStream);
    for (const remote of voice.remotes) {
      if (remote.stream) streams.push(remote.stream);
    }
    return streams;
  }, [voice.localStream, voice.remotes]);

  function saveName() {
    const next = nameDraft.trim() || "Guest";
    localStorage.setItem("gmv-display-name", next);
    setName(next);
  }

  return (
    <div className="flex flex-1 flex-col gap-6 lg:flex-row">
      <section className="min-w-0 flex-1 border border-[var(--line)] bg-[var(--surface)]">
        <div className="flex flex-wrap items-center gap-3 border-b border-[var(--line)] px-5 py-4">
          <Link
            href="/match"
            className="text-sm font-medium text-[var(--muted)] transition hover:text-[var(--ink)]"
          >
            ← 매칭
          </Link>
          <span className="text-[var(--line)]">/</span>
          <div className="min-w-0">
            <div className="font-display text-lg font-bold tracking-tight">{channel.name}</div>
            <div className="text-xs text-[var(--muted)]">
              {community.name} · {community.games.join(" · ")}
            </div>
          </div>
          {voice.joined && (
            <div className="ml-auto border border-[var(--ok)] bg-[var(--ok)]/10 px-2.5 py-1 text-xs font-bold text-[var(--ok)]">
              LIVE · {1 + voice.remotes.length}
            </div>
          )}
        </div>

        <div className="flex flex-col items-center px-5 py-10">
          <p className="font-display text-xs font-bold uppercase tracking-[0.2em] text-[var(--signal)]">
            Voice Lobby
          </p>
          <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight md:text-4xl">
            {channel.name}
          </h2>
          <p className="mt-3 max-w-md text-center text-sm text-[var(--muted)]">
            매칭된 파티 로비입니다. 참가 후 다른 탭에서도 같은 방으로 들어오면 통화가 연결됩니다.
          </p>

          {!voice.joined && (
            <div className="mt-8 w-full max-w-sm">
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.12em] text-[var(--dim)]">
                표시 이름
              </label>
              <input
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
                onBlur={saveName}
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveName();
                }}
                className="w-full border border-[var(--line)] bg-[var(--paper-2)] px-4 py-2.5 text-sm outline-none focus:border-[var(--ink)]"
              />
            </div>
          )}

          <div className="mt-8 grid w-full max-w-2xl grid-cols-2 gap-3 sm:grid-cols-3">
            {voice.joined && (
              <PeerTile
                name={`${name} (나)`}
                speaking={voice.localSpeaking}
                muted={voice.muted}
                self
              />
            )}
            {voice.remotes.map((peer) => (
              <div key={peer.id}>
                <PeerTile name={peer.name} speaking={peer.speaking} muted={false} />
                <RemoteAudio stream={peer.stream} muted={voice.deafened} />
              </div>
            ))}
            {!voice.joined && (
              <div className="col-span-full border border-dashed border-[var(--line)] px-6 py-12 text-center text-sm text-[var(--muted)]">
                참가하면 파티원이 여기에 표시됩니다.
              </div>
            )}
            {voice.joined && voice.remotes.length === 0 && (
              <div className="col-span-full border border-[var(--line)] bg-[var(--paper-2)] px-4 py-3 text-center text-sm text-[var(--muted)] sm:col-span-2">
                혼자입니다. 다른 탭에서 같은 로비에 들어와 테스트하세요.
              </div>
            )}
          </div>

          {voice.error && (
            <p className="mt-4 text-sm text-[var(--danger)]">{voice.error}</p>
          )}

          <div className="mt-8 flex flex-wrap justify-center gap-2">
            {!voice.joined ? (
              <button
                type="button"
                onClick={() => {
                  saveName();
                  void voice.join();
                }}
                disabled={voice.connecting}
                className="bg-[var(--signal)] px-8 py-3 text-sm font-bold text-white transition hover:bg-[var(--signal-deep)] disabled:opacity-60"
              >
                {voice.connecting ? "연결 중..." : "로비 참가"}
              </button>
            ) : (
              <>
                <ControlButton
                  danger={voice.muted}
                  onClick={voice.toggleMute}
                  label={voice.muted ? "음소거 해제" : "음소거"}
                />
                <ControlButton
                  danger={voice.deafened}
                  onClick={voice.toggleDeafen}
                  label={voice.deafened ? "듣기 켜기" : "듣기 끄기"}
                />
                <button
                  type="button"
                  onClick={() => void voice.leave()}
                  className="border border-[var(--danger)] px-5 py-3 text-sm font-bold text-[var(--danger)] transition hover:bg-[var(--danger)] hover:text-white"
                >
                  나가기
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      <aside className="w-full shrink-0 border border-[var(--line)] bg-[var(--surface)] lg:w-80">
        <div className="border-b border-[var(--line)] px-4 py-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-base font-bold">녹음 테스트</h3>
            {recorder.recording && (
              <span className="text-xs font-bold text-[var(--danger)]">
                REC {formatDuration(recorder.elapsedMs)}
              </span>
            )}
          </div>
          <p className="mt-1 text-xs leading-relaxed text-[var(--muted)]">
            내 마이크와 상대 목소리를 함께 녹음합니다.
          </p>
        </div>

        <div className="p-4">
          {!recorder.recording ? (
            <button
              type="button"
              onClick={() => void recorder.startRecording(recordStreams)}
              disabled={!voice.joined}
              className="w-full bg-[var(--ink)] px-3 py-2.5 text-sm font-bold text-white disabled:opacity-40"
            >
              녹음 시작
            </button>
          ) : (
            <button
              type="button"
              onClick={recorder.stopRecording}
              className="w-full border border-[var(--ink)] px-3 py-2.5 text-sm font-bold"
            >
              녹음 중지
            </button>
          )}

          {recorder.error && (
            <p className="mt-2 text-xs text-[var(--danger)]">{recorder.error}</p>
          )}

          <div className="mt-4 flex max-h-72 flex-col gap-2 overflow-y-auto">
            {recorder.recordings.length === 0 ? (
              <div className="border border-dashed border-[var(--line)] px-3 py-8 text-center text-xs text-[var(--dim)]">
                녹음본이 여기에 표시됩니다
              </div>
            ) : (
              recorder.recordings.map((item) => (
                <div key={item.id} className="border border-[var(--line)] bg-[var(--paper-2)] px-3 py-3">
                  <div className="truncate text-sm font-semibold">{item.name}</div>
                  <div className="mt-0.5 text-xs text-[var(--dim)]">
                    {formatDuration(item.durationMs)}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {recorder.playingId === item.id ? (
                      <SmallButton onClick={recorder.stopPlayback}>정지</SmallButton>
                    ) : (
                      <SmallButton onClick={() => recorder.play(item.id)}>재생</SmallButton>
                    )}
                    <SmallButton onClick={() => recorder.download(item.id)}>저장</SmallButton>
                    <SmallButton onClick={() => recorder.remove(item.id)}>삭제</SmallButton>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}

function PeerTile({
  name,
  speaking,
  muted,
  self,
}: {
  name: string;
  speaking: boolean;
  muted: boolean;
  self?: boolean;
}) {
  return (
    <div
      className={`flex flex-col items-center gap-3 border px-4 py-5 transition ${
        speaking
          ? "border-[var(--signal)] bg-[var(--signal-soft)]"
          : "border-[var(--line)] bg-[var(--paper-2)]"
      }`}
    >
      <div className="relative">
        <Avatar name={name.replace(" (나)", "")} size="lg" />
        <span
          className={`absolute -bottom-1 -right-1 h-3 w-3 border-2 border-[var(--paper-2)] ${
            muted ? "bg-[var(--danger)]" : "bg-[var(--ok)]"
          }`}
        />
      </div>
      <div className="text-center">
        <div className="text-sm font-bold">{name}</div>
        <div className="text-xs text-[var(--dim)]">
          {muted ? "음소거" : speaking ? "말하는 중" : self ? "대기" : "연결됨"}
        </div>
      </div>
    </div>
  );
}

function ControlButton({
  label,
  onClick,
  danger,
}: {
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-5 py-3 text-sm font-bold transition ${
        danger
          ? "bg-[var(--danger)] text-white"
          : "border border-[var(--line)] bg-[var(--paper-2)] text-[var(--ink)] hover:border-[var(--ink)]"
      }`}
    >
      {label}
    </button>
  );
}

function SmallButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="border border-[var(--line)] bg-[var(--surface)] px-2 py-1 text-xs font-medium text-[var(--muted)] transition hover:border-[var(--ink)] hover:text-[var(--ink)]"
    >
      {children}
    </button>
  );
}
