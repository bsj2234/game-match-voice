export function getIceServers(): RTCIceServer[] {
  const raw = process.env.NEXT_PUBLIC_ICE_SERVERS_JSON;
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as RTCIceServer[];
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch {
      console.warn("NEXT_PUBLIC_ICE_SERVERS_JSON parse failed");
    }
  }

  const servers: RTCIceServer[] = [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ];

  const turnUrl = process.env.NEXT_PUBLIC_TURN_URL;
  const turnUser = process.env.NEXT_PUBLIC_TURN_USERNAME;
  const turnPass = process.env.NEXT_PUBLIC_TURN_CREDENTIAL;

  if (turnUrl && turnUser && turnPass) {
    servers.push({
      urls: turnUrl.split(",").map((u) => u.trim()),
      username: turnUser,
      credential: turnPass,
    });
    return servers;
  }

  // Demo TURN for friend testing (rate-limited public relay).
  // Replace with your own coturn / Metered account for real service.
  servers.push(
    {
      urls: "turn:openrelay.metered.ca:80",
      username: "openrelayproject",
      credential: "openrelayproject",
    },
    {
      urls: "turn:openrelay.metered.ca:443",
      username: "openrelayproject",
      credential: "openrelayproject",
    },
    {
      urls: "turn:openrelay.metered.ca:443?transport=tcp",
      username: "openrelayproject",
      credential: "openrelayproject",
    },
  );

  return servers;
}
