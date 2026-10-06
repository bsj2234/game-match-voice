import { matchRooms } from "@/lib/mock-data";
import { configureWebPush } from "@/lib/push/vapid";
import type { PushSubscriber } from "@/lib/push/store";

export function lobbyUrlForGame(game: string) {
  const room = matchRooms.find((r) => r.game === game);
  if (!room) return "/match";
  return `/channels/${room.communityId}/${room.channelId}`;
}

export async function sendPushToSubscriber(
  subscriber: PushSubscriber,
  payload: { title: string; body: string; url: string },
) {
  const webpush = configureWebPush();
  try {
    await webpush.sendNotification(
      {
        endpoint: subscriber.subscription.endpoint,
        keys: subscriber.subscription.keys,
      },
      JSON.stringify(payload),
    );
    return true;
  } catch (err) {
    const status = (err as { statusCode?: number }).statusCode;
    if (status === 404 || status === 410) {
      return false;
    }
    console.error("push send failed", err);
    return false;
  }
}
