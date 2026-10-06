"use client";

import { useCallback, useEffect, useState } from "react";
import type { UserPreferences } from "@/lib/preferences";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) output[i] = raw.charCodeAt(i);
  return output;
}

async function ensureServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    throw new Error("이 브라우저는 웹 푸시를 지원하지 않습니다.");
  }
  const reg = await navigator.serviceWorker.register("/sw.js");
  await navigator.serviceWorker.ready;
  return reg;
}

export function useWebPush(prefs: UserPreferences | null) {
  const [supported, setSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [subscribed, setSubscribed] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastMatch, setLastMatch] = useState<string | null>(null);

  useEffect(() => {
    const ok =
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      "PushManager" in window &&
      "Notification" in window;
    setSupported(ok);
    if (ok) setPermission(Notification.permission);
  }, []);

  useEffect(() => {
    if (!supported) return;
    void (async () => {
      try {
        const reg = await ensureServiceWorker();
        const sub = await reg.pushManager.getSubscription();
        setSubscribed(Boolean(sub));
      } catch {
        /* ignore */
      }
    })();
  }, [supported]);

  const syncSubscription = useCallback(
    async (waitingFlag?: boolean) => {
      if (!prefs) throw new Error("취향을 먼저 저장해 주세요.");
      const reg = await ensureServiceWorker();
      let sub = await reg.pushManager.getSubscription();

      if (!sub) {
        const res = await fetch("/api/push/vapid");
        if (!res.ok) throw new Error("푸시 서버 키가 아직 설정되지 않았습니다.");
        const { publicKey } = (await res.json()) as { publicKey: string };
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey),
        });
      }

      const json = sub.toJSON();
      if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
        throw new Error("구독 정보가 올바르지 않습니다.");
      }

      const body = {
        subscription: {
          endpoint: json.endpoint,
          keys: { p256dh: json.keys.p256dh, auth: json.keys.auth },
        },
        displayName: prefs.displayName,
        games: prefs.games,
        playstyles: prefs.playstyles,
        waiting: waitingFlag ?? waiting,
      };

      const saveRes = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!saveRes.ok) throw new Error("구독 저장에 실패했습니다.");

      setSubscribed(true);
      setPermission(Notification.permission);
      return body.subscription;
    },
    [prefs, waiting],
  );

  const enablePush = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm !== "granted") {
        throw new Error("알림 권한이 거부되었습니다.");
      }
      await syncSubscription(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "푸시 활성화 실패");
    } finally {
      setBusy(false);
    }
  }, [syncSubscription]);

  const disablePush = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      const reg = await ensureServiceWorker();
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await fetch("/api/push/subscribe", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
        await sub.unsubscribe();
      }
      setSubscribed(false);
      setWaiting(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "구독 해제 실패");
    } finally {
      setBusy(false);
    }
  }, []);

  const setMatchWaiting = useCallback(
    async (nextWaiting: boolean) => {
      setBusy(true);
      setError(null);
      setLastMatch(null);
      try {
        if (!prefs || prefs.games.length === 0) {
          throw new Error("취향(게임)을 먼저 저장해 주세요.");
        }
        if (Notification.permission !== "granted") {
          const perm = await Notification.requestPermission();
          setPermission(perm);
          if (perm !== "granted") throw new Error("알림 권한이 필요합니다.");
        }

        const subscription = await syncSubscription(nextWaiting);
        const res = await fetch("/api/push/waiting", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subscription,
            displayName: prefs.displayName,
            games: prefs.games,
            playstyles: prefs.playstyles,
            waiting: nextWaiting,
          }),
        });
        if (!res.ok) {
          const data = (await res.json().catch(() => ({}))) as { error?: string };
          throw new Error(data.error || "대기 상태 변경 실패 (VAPID 키 확인)");
        }
        const data = (await res.json()) as {
          waiting: boolean;
          matched: { name: string; games: string[] }[];
        };
        setWaiting(data.waiting);
        if (data.matched?.length) {
          setLastMatch(
            `${data.matched.map((m) => m.name).join(", ")}님과 ${data.matched[0].games.join(", ")} 매칭! 알림을 확인하세요.`,
          );
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "매칭 대기 실패");
      } finally {
        setBusy(false);
      }
    },
    [prefs, syncSubscription],
  );

  return {
    supported,
    permission,
    subscribed,
    waiting,
    busy,
    error,
    lastMatch,
    enablePush,
    disablePush,
    setMatchWaiting,
  };
}
