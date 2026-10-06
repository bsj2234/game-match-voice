import {
  removeSubscriber,
  upsertSubscriber,
  type StoredPushSubscription,
} from "@/lib/push/store";

type Body = {
  subscription?: StoredPushSubscription;
  displayName?: string;
  games?: string[];
  playstyles?: string[];
  waiting?: boolean;
};

export async function POST(request: Request) {
  const body = (await request.json()) as Body;
  const sub = body.subscription;
  if (!sub?.endpoint || !sub.keys?.p256dh || !sub.keys?.auth) {
    return Response.json({ error: "subscription required" }, { status: 400 });
  }

  const saved = upsertSubscriber({
    endpoint: sub.endpoint,
    subscription: sub,
    displayName: body.displayName?.trim() || "Guest",
    games: body.games ?? [],
    playstyles: body.playstyles ?? [],
    waiting: body.waiting ?? false,
  });

  return Response.json({
    ok: true,
    waiting: saved.waiting,
    games: saved.games,
  });
}

export async function DELETE(request: Request) {
  const body = (await request.json()) as { endpoint?: string };
  if (!body.endpoint) {
    return Response.json({ error: "endpoint required" }, { status: 400 });
  }
  removeSubscriber(body.endpoint);
  return Response.json({ ok: true });
}
