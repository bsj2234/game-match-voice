import { subscribe, type SignalMessage } from "@/lib/voice/signaling-store";

type RouteContext = { params: Promise<{ roomId: string }> };

export async function GET(request: Request, context: RouteContext) {
  const { roomId } = await context.params;
  const decoded = decodeURIComponent(roomId);
  const peerId = new URL(request.url).searchParams.get("peerId");

  if (!peerId) {
    return Response.json({ error: "peerId required" }, { status: 400 });
  }

  const encoder = new TextEncoder();
  let cleanup: (() => void) | undefined;
  let heartbeat: ReturnType<typeof setInterval> | undefined;

  const stream = new ReadableStream({
    start(controller) {
      const send = (data: unknown) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      send({ type: "connected", peerId });

      cleanup = subscribe(decoded, peerId, (msg: SignalMessage) => {
        try {
          send(msg);
        } catch {
          cleanup?.();
        }
      });

      heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: ping\n\n`));
        } catch {
          clearInterval(heartbeat);
          cleanup?.();
        }
      }, 15000);

      request.signal.addEventListener("abort", () => {
        clearInterval(heartbeat);
        cleanup?.();
        try {
          controller.close();
        } catch {
          /* already closed */
        }
      });
    },
    cancel() {
      clearInterval(heartbeat);
      cleanup?.();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
