export type StoredPushSubscription = {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
};

export type PushSubscriber = {
  endpoint: string;
  subscription: StoredPushSubscription;
  displayName: string;
  games: string[];
  playstyles: string[];
  waiting: boolean;
  updatedAt: number;
};

type PushStore = {
  byEndpoint: Map<string, PushSubscriber>;
};

const globalForPush = globalThis as typeof globalThis & {
  __meltinPushStore?: PushStore;
};

function getStore(): PushStore {
  if (!globalForPush.__meltinPushStore) {
    globalForPush.__meltinPushStore = { byEndpoint: new Map() };
  }
  return globalForPush.__meltinPushStore;
}

export function upsertSubscriber(
  input: Omit<PushSubscriber, "updatedAt"> & { updatedAt?: number },
) {
  const store = getStore();
  const prev = store.byEndpoint.get(input.endpoint);
  const next: PushSubscriber = {
    ...prev,
    ...input,
    waiting: input.waiting ?? prev?.waiting ?? false,
    updatedAt: Date.now(),
  };
  store.byEndpoint.set(input.endpoint, next);
  return next;
}

export function removeSubscriber(endpoint: string) {
  return getStore().byEndpoint.delete(endpoint);
}

export function getSubscriber(endpoint: string) {
  return getStore().byEndpoint.get(endpoint) ?? null;
}

export function listSubscribers() {
  return Array.from(getStore().byEndpoint.values());
}

export function findWaitingMatches(games: string[], exceptEndpoint: string) {
  const set = new Set(games);
  return listSubscribers().filter((s) => {
    if (!s.waiting) return false;
    if (s.endpoint === exceptEndpoint) return false;
    return s.games.some((g) => set.has(g));
  });
}

export function sharedGames(a: string[], b: string[]) {
  const set = new Set(a);
  return b.filter((g) => set.has(g));
}
