import { postSignal, type SignalType } from "@/lib/voice/signaling-store";

type RouteContext = { params: Promise<{ roomId: string }> };

export async function POST(request: Request, context: RouteContext) {
  const { roomId } = await context.params;
  const decoded = decodeURIComponent(roomId);
  const body = (await request.json()) as {
    from: string;
    to: string;
    type: SignalType;
    payload?: unknown;
  };

  if (!body.from || !body.to || !body.type) {
    return Response.json({ error: "from, to, type required" }, { status: 400 });
  }

  if (!["offer", "answer", "ice", "peer-joined", "peer-left"].includes(body.type)) {
    return Response.json({ error: "invalid type" }, { status: 400 });
  }

  postSignal(decoded, {
    from: body.from,
    to: body.to,
    type: body.type,
    payload: body.payload,
  });

  return Response.json({ ok: true });
}
