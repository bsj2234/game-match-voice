import {
  joinRoom,
  leaveRoom,
  listPeers,
} from "@/lib/voice/signaling-store";

type RouteContext = { params: Promise<{ roomId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { roomId } = await context.params;
  return Response.json({ peers: listPeers(decodeURIComponent(roomId)) });
}

export async function POST(request: Request, context: RouteContext) {
  const { roomId } = await context.params;
  const decoded = decodeURIComponent(roomId);
  const body = (await request.json()) as {
    action: "join" | "leave";
    peerId: string;
    name?: string;
  };

  if (!body.peerId) {
    return Response.json({ error: "peerId required" }, { status: 400 });
  }

  if (body.action === "join") {
    const others = joinRoom(decoded, {
      id: body.peerId,
      name: body.name?.trim() || "Guest",
    });
    return Response.json({ peers: others });
  }

  if (body.action === "leave") {
    leaveRoom(decoded, body.peerId);
    return Response.json({ ok: true });
  }

  return Response.json({ error: "invalid action" }, { status: 400 });
}
