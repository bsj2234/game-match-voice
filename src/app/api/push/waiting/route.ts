import { lobbyUrlForGame, sendPushToSubscriber } from "@/lib/push/send";
import {
  findWaitingMatches,
  getSubscriber,
  removeSubscriber,
  sharedGames,
  upsertSubscriber,
  type StoredPushSubscription,
} from "@/lib/push/store";

type Body = {
  subscription: StoredPushSubscription;
  displayName?: string;
  games: string[];
  playstyles?: string[];
  waiting: boolean;
};

export async function POST(request: Request) {
  const body = (await request.json()) as Body;
  const sub = body.subscription;
  if (!sub?.endpoint || !Array.isArray(body.games)) {
    return Response.json({ error: "invalid body" }, { status: 400 });
  }

  const me = upsertSubscriber({
    endpoint: sub.endpoint,
    subscription: sub,
    displayName: body.displayName?.trim() || "Guest",
    games: body.games,
    playstyles: body.playstyles ?? [],
    waiting: Boolean(body.waiting),
  });

  if (!me.waiting || me.games.length === 0) {
    return Response.json({ ok: true, waiting: me.waiting, matched: [] });
  }

  const matches = findWaitingMatches(me.games, me.endpoint);
  const notified: { name: string; games: string[] }[] = [];

  for (const other of matches) {
    const overlap = sharedGames(me.games, other.games);
    if (overlap.length === 0) continue;
    const game = overlap[0];
    const url = lobbyUrlForGame(game);

    const okOther = await sendPushToSubscriber(other, {
      title: "MeltIn · 매칭 알림",
      body: `${me.displayName}님이 ${game} 파티를 기다려요. 눌러서 로비로 들어가세요.`,
      url,
    });
    if (!okOther) removeSubscriber(other.endpoint);

    const okMe = await sendPushToSubscriber(me, {
      title: "MeltIn · 매칭 알림",
      body: `${other.displayName}님이 ${game}에 맞춰졌어요. 로비로 들어가세요.`,
      url,
    });
    if (!okMe) {
      // keep subscription if transient fail
    }

    // After match ping, clear waiting so we don't spam
    upsertSubscriber({ ...other, waiting: false });
    notified.push({ name: other.displayName, games: overlap });
  }

  if (notified.length > 0) {
    upsertSubscriber({ ...me, waiting: false });
    const latest = getSubscriber(me.endpoint);
    return Response.json({
      ok: true,
      waiting: latest?.waiting ?? false,
      matched: notified,
    });
  }

  return Response.json({ ok: true, waiting: true, matched: [] });
}
