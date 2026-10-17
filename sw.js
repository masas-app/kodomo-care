// こどもケア: プッシュ受信の土台。個人情報やページをキャッシュしません。
self.addEventListener('install', event => { self.skipWaiting(); });
self.addEventListener('activate', event => { event.waitUntil(self.clients.claim()); });
self.addEventListener('push', event => {
  // 将来サーバーから配信する通知は、機微な医療情報を本文に含めない方針です。
  let payload = {};
  try { payload = event.data ? event.data.json() : {}; } catch (_) {}
  const title = 'こどもケア';
  const body = typeof payload.body === 'string' ? payload.body.slice(0, 120) : 'アプリに新しいお知らせがあります。';
  event.waitUntil(self.registration.showNotification(title, { body, tag: 'kodomo-care-reminder', data: { url: './' } }));
});
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(clients => {
    const existing = clients.find(c => c.url.startsWith(self.registration.scope));
    return existing ? existing.focus() : self.clients.openWindow(self.registration.scope);
  }));
});
