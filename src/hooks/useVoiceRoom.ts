"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getIceServers } from "@/lib/voice/ice";
import type { SignalMessage, VoicePeerInfo } from "@/lib/voice/signaling-store";

export type RemotePeer = {
  id: string;
  name: string;
  stream: MediaStream | null;
  speaking: boolean;
};

type UseVoiceRoomOptions = {
  roomId: string;
  displayName: string;
};

function createPeerId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `peer-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function useVoiceRoom({ roomId, displayName }: UseVoiceRoomOptions) {
  const [joined, setJoined] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [muted, setMuted] = useState(false);
  const [deafened, setDeafened] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [localSpeaking, setLocalSpeaking] = useState(false);
  const [remotes, setRemotes] = useState<RemotePeer[]>([]);
  const [peerId] = useState(createPeerId);

  const localStreamRef = useRef<MediaStream | null>(null);
  const peersRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const remoteStreamsRef = useRef<Map<string, MediaStream>>(new Map());
  const peerNamesRef = useRef<Map<string, string>>(new Map());
  const eventSourceRef = useRef<EventSource | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analysersRef = useRef<Map<string, AnalyserNode>>(new Map());
  const speakingRafRef = useRef<number | null>(null);
  const mutedRef = useRef(false);
  const deafenedRef = useRef(false);
  const joinedRef = useRef(false);

  const roomPath = encodeURIComponent(roomId);

  const upsertRemote = useCallback((id: string, patch: Partial<RemotePeer>) => {
    setRemotes((prev) => {
      const existing = prev.find((p) => p.id === id);
      if (!existing) {
        return [
          ...prev,
          {
            id,
            name: patch.name ?? peerNamesRef.current.get(id) ?? "Peer",
            stream: patch.stream ?? null,
            speaking: patch.speaking ?? false,
          },
        ];
      }
      return prev.map((p) => (p.id === id ? { ...p, ...patch } : p));
    });
  }, []);

  const removeRemote = useCallback((id: string) => {
    setRemotes((prev) => prev.filter((p) => p.id !== id));
    remoteStreamsRef.current.delete(id);
    peerNamesRef.current.delete(id);
    const analyser = analysersRef.current.get(id);
    if (analyser) {
      analyser.disconnect();
      analysersRef.current.delete(id);
    }
  }, []);

  const sendSignal = useCallback(
    async (to: string, type: SignalMessage["type"], payload?: unknown) => {
      await fetch(`/api/voice/${roomPath}/signal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ from: peerId, to, type, payload }),
      });
    },
    [peerId, roomPath],
  );

  const attachAnalyser = useCallback((id: string, stream: MediaStream) => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
    }
    const ctx = audioCtxRef.current;
    const existing = analysersRef.current.get(id);
    existing?.disconnect();

    const source = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);
    analysersRef.current.set(id, analyser);
  }, []);

  const createPeerConnection = useCallback(
    (remoteId: string) => {
      const existing = peersRef.current.get(remoteId);
      if (existing) return existing;

      const pc = new RTCPeerConnection({ iceServers: getIceServers() });
      peersRef.current.set(remoteId, pc);

      const local = localStreamRef.current;
      if (local) {
        for (const track of local.getTracks()) {
          pc.addTrack(track, local);
        }
      }

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          void sendSignal(remoteId, "ice", event.candidate.toJSON());
        }
      };

      pc.ontrack = (event) => {
        const stream = event.streams[0] ?? new MediaStream([event.track]);
        remoteStreamsRef.current.set(remoteId, stream);
        attachAnalyser(remoteId, stream);
        upsertRemote(remoteId, { stream });
      };

      pc.onconnectionstatechange = () => {
        if (pc.connectionState === "failed" || pc.connectionState === "closed") {
          pc.close();
          peersRef.current.delete(remoteId);
          removeRemote(remoteId);
        }
      };

      return pc;
    },
    [attachAnalyser, removeRemote, sendSignal, upsertRemote],
  );

  const makeOffer = useCallback(
    async (remoteId: string) => {
      const pc = createPeerConnection(remoteId);
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      await sendSignal(remoteId, "offer", offer);
    },
    [createPeerConnection, sendSignal],
  );

  const handleSignal = useCallback(
    async (msg: SignalMessage) => {
      if (msg.from === peerId) return;

      if (msg.type === "peer-joined") {
        const info = msg.payload as VoicePeerInfo;
        peerNamesRef.current.set(info.id, info.name);
        upsertRemote(info.id, { name: info.name });
        // Existing peer creates the offer to the new joiner
        await makeOffer(info.id);
        return;
      }

      if (msg.type === "peer-left") {
        const id = (msg.payload as { id: string }).id;
        peersRef.current.get(id)?.close();
        peersRef.current.delete(id);
        removeRemote(id);
        return;
      }

      if (msg.type === "offer") {
        const pc = createPeerConnection(msg.from);
        await pc.setRemoteDescription(msg.payload as RTCSessionDescriptionInit);
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        await sendSignal(msg.from, "answer", answer);
        return;
      }

      if (msg.type === "answer") {
        const pc = peersRef.current.get(msg.from);
        if (!pc) return;
        await pc.setRemoteDescription(msg.payload as RTCSessionDescriptionInit);
        return;
      }

      if (msg.type === "ice") {
        const pc = peersRef.current.get(msg.from) ?? createPeerConnection(msg.from);
        try {
          await pc.addIceCandidate(msg.payload as RTCIceCandidateInit);
        } catch {
          /* candidate may arrive early */
        }
      }
    },
    [createPeerConnection, makeOffer, peerId, removeRemote, sendSignal, upsertRemote],
  );

  const stopSpeakingMonitor = useCallback(() => {
    if (speakingRafRef.current != null) {
      cancelAnimationFrame(speakingRafRef.current);
      speakingRafRef.current = null;
    }
  }, []);

  const startSpeakingMonitor = useCallback(() => {
    stopSpeakingMonitor();
    const data = new Uint8Array(32);

    const tick = () => {
      for (const [id, analyser] of analysersRef.current) {
        analyser.getByteFrequencyData(data);
        const avg = data.reduce((a, b) => a + b, 0) / data.length;
        const speaking = avg > 18;
        if (id === "local") {
          const next = speaking && !mutedRef.current;
          setLocalSpeaking((prev) => (prev === next ? prev : next));
        } else {
          setRemotes((prev) => {
            const peer = prev.find((p) => p.id === id);
            if (!peer || peer.speaking === speaking) return prev;
            return prev.map((p) => (p.id === id ? { ...p, speaking } : p));
          });
        }
      }
      speakingRafRef.current = requestAnimationFrame(tick);
    };
    speakingRafRef.current = requestAnimationFrame(tick);
  }, [stopSpeakingMonitor]);

  const cleanup = useCallback(() => {
    stopSpeakingMonitor();
    eventSourceRef.current?.close();
    eventSourceRef.current = null;

    for (const pc of peersRef.current.values()) pc.close();
    peersRef.current.clear();

    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current = null;
    setLocalStream(null);

    for (const analyser of analysersRef.current.values()) analyser.disconnect();
    analysersRef.current.clear();
    remoteStreamsRef.current.clear();
    peerNamesRef.current.clear();
    setRemotes([]);
    setLocalSpeaking(false);

    void audioCtxRef.current?.close();
    audioCtxRef.current = null;
  }, [stopSpeakingMonitor]);

  const leave = useCallback(async () => {
    if (joinedRef.current) {
      try {
        await fetch(`/api/voice/${roomPath}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "leave", peerId }),
          keepalive: true,
        });
      } catch {
        /* ignore */
      }
    }
    joinedRef.current = false;
    setJoined(false);
    setConnecting(false);
    cleanup();
  }, [cleanup, peerId, roomPath]);

  const join = useCallback(async () => {
    if (joinedRef.current || connecting) return;
    setConnecting(true);
    setError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: false,
      });

      localStreamRef.current = stream;
      setLocalStream(stream);
      attachAnalyser("local", stream);
      if (audioCtxRef.current?.state === "suspended") {
        await audioCtxRef.current.resume();
      }
      startSpeakingMonitor();

      if (mutedRef.current) {
        stream.getAudioTracks().forEach((t) => {
          t.enabled = false;
        });
      }

      const es = new EventSource(
        `/api/voice/${roomPath}/stream?peerId=${encodeURIComponent(peerId)}`,
      );
      eventSourceRef.current = es;

      let resolved = false;
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          if (!resolved) reject(new Error("시그널링 연결 시간 초과"));
        }, 8000);

        es.onmessage = (event) => {
          const data = JSON.parse(event.data as string) as {
            type: string;
            [key: string]: unknown;
          };
          if (data.type === "connected") {
            if (!resolved) {
              resolved = true;
              clearTimeout(timeout);
              resolve();
            }
            return;
          }
          void handleSignal(data as unknown as SignalMessage).catch(
            (err: unknown) => {
              console.error(err);
            },
          );
        };

        es.onerror = () => {
          if (!resolved) {
            clearTimeout(timeout);
            reject(new Error("시그널링 서버 연결 실패"));
            return;
          }
          if (joinedRef.current) {
            setError("시그널링 연결이 끊겼습니다. 다시 참가해 주세요.");
          }
        };
      });

      const res = await fetch(`/api/voice/${roomPath}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "join",
          peerId,
          name: displayName || "Guest",
        }),
      });
      if (!res.ok) throw new Error("방 참가 실패");

      const { peers } = (await res.json()) as { peers: VoicePeerInfo[] };
      for (const peer of peers) {
        peerNamesRef.current.set(peer.id, peer.name);
        upsertRemote(peer.id, { name: peer.name });
        // New joiner waits for offers from existing peers (they get peer-joined)
      }

      joinedRef.current = true;
      setJoined(true);
    } catch (err) {
      cleanup();
      const message =
        err instanceof Error ? err.message : "마이크 또는 연결에 실패했습니다.";
      setError(
        message.includes("Permission") || message.includes("NotAllowed")
          ? "마이크 권한을 허용해 주세요."
          : message,
      );
    } finally {
      setConnecting(false);
    }
  }, [
    attachAnalyser,
    cleanup,
    connecting,
    displayName,
    handleSignal,
    peerId,
    roomPath,
    startSpeakingMonitor,
    upsertRemote,
  ]);

  const toggleMute = useCallback(() => {
    setMuted((prev) => {
      const next = !prev;
      mutedRef.current = next;
      localStreamRef.current?.getAudioTracks().forEach((t) => {
        t.enabled = !next && !deafenedRef.current;
      });
      return next;
    });
  }, []);

  const toggleDeafen = useCallback(() => {
    setDeafened((prev) => {
      const next = !prev;
      deafenedRef.current = next;
      if (next) {
        mutedRef.current = true;
        setMuted(true);
        localStreamRef.current?.getAudioTracks().forEach((t) => {
          t.enabled = false;
        });
      }
      return next;
    });
  }, []);

  useEffect(() => {
    return () => {
      void leave();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- unmount only
  }, []);

  useEffect(() => {
    const onUnload = () => {
      if (!joinedRef.current) return;
      navigator.sendBeacon(
        `/api/voice/${roomPath}`,
        new Blob(
          [JSON.stringify({ action: "leave", peerId })],
          { type: "application/json" },
        ),
      );
    };
    window.addEventListener("pagehide", onUnload);
    return () => window.removeEventListener("pagehide", onUnload);
  }, [peerId, roomPath]);

  return {
    peerId,
    joined,
    connecting,
    error,
    muted,
    deafened,
    localStream,
    localSpeaking,
    remotes,
    join,
    leave,
    toggleMute,
    toggleDeafen,
  };
}
