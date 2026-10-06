/* MeltIn service worker — web push */
self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  let data = { title: "MeltIn", body: "새 알림이 있어요.", url: "/match" };
  try {
    if (event.data) data = Object.assign(data, event.data.json());
  } catch (_) {
    /* ignore */
  }

  event.waitUntil(
    self.registration.showNotification(data.title || "MeltIn", {
      body: data.body || "",
      data: { url: data.url || "/match" },
      icon: "/favicon.ico",
      badge: "/favicon.ico",
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "/match";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url && "focus" in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    }),
  );
});
