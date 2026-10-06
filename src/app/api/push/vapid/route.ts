import { getVapidPublicKey } from "@/lib/push/vapid";

export async function GET() {
  const publicKey = getVapidPublicKey();
  if (!publicKey) {
    return Response.json(
      { error: "VAPID public key not configured" },
      { status: 503 },
    );
  }
  return Response.json({ publicKey });
}
