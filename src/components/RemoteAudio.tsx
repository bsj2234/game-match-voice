"use client";

import { useEffect, useRef } from "react";

export function RemoteAudio({
  stream,
  muted,
}: {
  stream: MediaStream | null;
  muted?: boolean;
}) {
  const ref = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.srcObject = stream;
    if (stream) {
      void el.play().catch(() => {
        /* autoplay may require a prior user gesture; join already is one */
      });
    }
  }, [stream]);

  return <audio ref={ref} autoPlay playsInline muted={muted} className="hidden" />;
}
