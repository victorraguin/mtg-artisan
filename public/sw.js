self.addEventListener('push', event => {
  const data = event.data?.json() || {};
  const { title, body, icon, url } = data;
  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon,
      data: { url }
    })
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const url = event.notification.data?.url;
  if (url) {
    event.waitUntil(clients.openWindow(url));
  }
});
