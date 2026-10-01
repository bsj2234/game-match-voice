"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type RecordingItem = {
  id: string;
  name: string;
  blob: Blob;
  url: string;
  createdAt: number;
  durationMs: number;
};

function pickMimeType() {
  const candidates = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
    "audio/ogg;codecs=opus",
  ];
  for (const type of candidates) {
    if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(type)) {
      return type;
    }
  }
  return "";
}

/**
 * Mix local + remote streams into one MediaStream for recording "what you hear + say".
 */
export function useVoiceRecorder() {
  const [recordings, setRecordings] = useState<RecordingItem[]>([]);
  const [recording, setRecording] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startedAtRef = useRef(0);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mixCtxRef = useRef<AudioContext | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const sourcesRef = useRef<MediaStreamAudioSourceNode[]>([]);

  const clearTimer = () => {
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
  };

  const stopMixing = () => {
    for (const source of sourcesRef.current) {
      try {
        source.disconnect();
      } catch {
        /* ignore */
      }
    }
    sourcesRef.current = [];
    void mixCtxRef.current?.close();
    mixCtxRef.current = null;
  };

  const buildMixStream = useCallback((streams: MediaStream[]) => {
    stopMixing();
    const ctx = new AudioContext();
    mixCtxRef.current = ctx;
    const dest = ctx.createMediaStreamDestination();

    for (const stream of streams) {
      if (stream.getAudioTracks().length === 0) continue;
      const source = ctx.createMediaStreamSource(stream);
      source.connect(dest);
      sourcesRef.current.push(source);
    }

    return dest.stream;
  }, []);

  const startRecording = useCallback(
    async (streams: MediaStream[]) => {
      setError(null);
      if (recording) return;

      const active = streams.filter((s) => s.active && s.getAudioTracks().length > 0);
      if (active.length === 0) {
        setError("녹음할 오디오 스트림이 없습니다. 먼저 음성 채널에 참가하세요.");
        return;
      }

      try {
        const mixed = buildMixStream(active);
        if (mixCtxRef.current?.state === "suspended") {
          await mixCtxRef.current.resume();
        }
        const mimeType = pickMimeType();
        const recorder = new MediaRecorder(
          mixed,
          mimeType ? { mimeType } : undefined,
        );
        chunksRef.current = [];
        recorderRef.current = recorder;
        startedAtRef.current = Date.now();
        setElapsedMs(0);

        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) chunksRef.current.push(event.data);
        };

        recorder.onstop = () => {
          clearTimer();
          const durationMs = Date.now() - startedAtRef.current;
          const type = recorder.mimeType || mimeType || "audio/webm";
          const blob = new Blob(chunksRef.current, { type });
          const url = URL.createObjectURL(blob);
          const item: RecordingItem = {
            id: crypto.randomUUID(),
            name: `녹음 ${new Date().toLocaleTimeString("ko-KR")}`,
            blob,
            url,
            createdAt: Date.now(),
            durationMs,
          };
          setRecordings((prev) => [item, ...prev]);
          setRecording(false);
          stopMixing();
          recorderRef.current = null;
        };

        recorder.start(250);
        setRecording(true);
        tickRef.current = setInterval(() => {
          setElapsedMs(Date.now() - startedAtRef.current);
        }, 200);
      } catch (err) {
        stopMixing();
        setError(err instanceof Error ? err.message : "녹음을 시작할 수 없습니다.");
      }
    },
    [buildMixStream, recording],
  );

  const stopRecording = useCallback(() => {
    const recorder = recorderRef.current;
    if (!recorder || recorder.state === "inactive") return;
    recorder.stop();
  }, []);

  const play = useCallback((id: string) => {
    const item = recordings.find((r) => r.id === id);
    if (!item) return;

    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    const audio = audioRef.current;
    audio.pause();
    audio.src = item.url;
    audio.onended = () => setPlayingId(null);
    void audio.play().then(() => setPlayingId(id));
  }, [recordings]);

  const stopPlayback = useCallback(() => {
    audioRef.current?.pause();
    if (audioRef.current) audioRef.current.currentTime = 0;
    setPlayingId(null);
  }, []);

  const download = useCallback((id: string) => {
    const item = recordings.find((r) => r.id === id);
    if (!item) return;
    const a = document.createElement("a");
    a.href = item.url;
    a.download = `${item.name.replace(/[^\w가-힣\- ]+/g, "")}.webm`;
    a.click();
  }, [recordings]);

  const remove = useCallback(
    (id: string) => {
      if (playingId === id) stopPlayback();
      setRecordings((prev) => {
        const target = prev.find((r) => r.id === id);
        if (target) URL.revokeObjectURL(target.url);
        return prev.filter((r) => r.id !== id);
      });
    },
    [playingId, stopPlayback],
  );

  useEffect(() => {
    return () => {
      clearTimer();
      if (recorderRef.current && recorderRef.current.state !== "inactive") {
        recorderRef.current.stop();
      }
      stopMixing();
      audioRef.current?.pause();
      for (const item of recordings) URL.revokeObjectURL(item.url);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- unmount cleanup only
  }, []);

  return {
    recordings,
    recording,
    elapsedMs,
    error,
    playingId,
    startRecording,
    stopRecording,
    play,
    stopPlayback,
    download,
    remove,
  };
}

export function formatDuration(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60)
    .toString()
    .padStart(2, "0");
  const s = (total % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}
