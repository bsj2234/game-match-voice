export type VoicePeerInfo = {
  id: string;
  name: string;
  joinedAt: number;
};

export type SignalType = "peer-joined" | "peer-left" | "offer" | "answer" | "ice";

export type SignalMessage = {
  id: string;
  roomId: string;
  from: string;
  to: string | "*";
  type: SignalType;
  payload?: unknown;
  ts: number;
};

type RoomState = {
  peers: Map<string, VoicePeerInfo>;
  signals: SignalMessage[];
  listeners: Map<string, Set<(msg: SignalMessage) => void>>;
};

type VoiceStore = {
  rooms: Map<string, RoomState>;
};

const globalForVoice = globalThis as typeof globalThis & {
  __voiceStore?: VoiceStore;
};

function getStore(): VoiceStore {
  if (!globalForVoice.__voiceStore) {
    globalForVoice.__voiceStore = { rooms: new Map() };
  }
  return globalForVoice.__voiceStore;
}

function getOrCreateRoom(roomId: string): RoomState {
  const store = getStore();
  let room = store.rooms.get(roomId);
  if (!room) {
    room = {
      peers: new Map(),
      signals: [],
      listeners: new Map(),
    };
    store.rooms.set(roomId, room);
  }
  return room;
}

function emit(room: RoomState, message: SignalMessage) {
  room.signals.push(message);
  if (room.signals.length > 500) {
    room.signals = room.signals.slice(-300);
  }

  for (const [peerId, listeners] of room.listeners) {
    if (message.to !== "*" && message.to !== peerId) continue;
    // Never echo a peer's own directed signals back to them
    if (message.from === peerId) continue;
    for (const listener of listeners) listener(message);
  }
}

export function listPeers(roomId: string): VoicePeerInfo[] {
  return Array.from(getOrCreateRoom(roomId).peers.values());
}

export function joinRoom(
  roomId: string,
  peer: { id: string; name: string },
): VoicePeerInfo[] {
  const room = getOrCreateRoom(roomId);
  const info: VoicePeerInfo = {
    id: peer.id,
    name: peer.name,
    joinedAt: Date.now(),
  };
  room.peers.set(peer.id, info);

  emit(room, {
    id: crypto.randomUUID(),
    roomId,
    from: peer.id,
    to: "*",
    type: "peer-joined",
    payload: info,
    ts: Date.now(),
  });

  return listPeers(roomId).filter((p) => p.id !== peer.id);
}

export function leaveRoom(roomId: string, peerId: string) {
  const room = getOrCreateRoom(roomId);
  if (!room.peers.has(peerId)) return;
  room.peers.delete(peerId);
  room.listeners.delete(peerId);

  emit(room, {
    id: crypto.randomUUID(),
    roomId,
    from: peerId,
    to: "*",
    type: "peer-left",
    payload: { id: peerId },
    ts: Date.now(),
  });

  if (room.peers.size === 0) {
    getStore().rooms.delete(roomId);
  }
}

export function postSignal(
  roomId: string,
  message: Omit<SignalMessage, "id" | "ts" | "roomId">,
) {
  const room = getOrCreateRoom(roomId);
  emit(room, {
    ...message,
    id: crypto.randomUUID(),
    roomId,
    ts: Date.now(),
  });
}

export function subscribe(
  roomId: string,
  peerId: string,
  listener: (msg: SignalMessage) => void,
) {
  const room = getOrCreateRoom(roomId);
  let set = room.listeners.get(peerId);
  if (!set) {
    set = new Set();
    room.listeners.set(peerId, set);
  }
  set.add(listener);
  return () => {
    set?.delete(listener);
    if (set && set.size === 0) room.listeners.delete(peerId);
  };
}
