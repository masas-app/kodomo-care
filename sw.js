// こどもケア: アプリ更新・通知テスト用 Service Worker
const CACHE_PREFIX = 'kodomo-care-';
const VERSION = '2026.10.15.2';
self.addEventListener('install', event => { self.skipWaiting(); });
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter(name => name.startsWith(CACHE_PREFIX)).map(name => caches.delete(name)));
    await self.clients.claim();
  })());
});
// HTMLを古いキャッシュから返さない（通信可能なときは最新のGitHub Pagesを使用）
self.addEventListener('fetch', event => {
  if (event.request.mode === 'navigate') event.respondWith(fetch(event.request));
});
self.addEventListener('push', event => {
  let payload = {};
  try { payload = event.data ? event.data.json() : {}; } catch { payload = {body: event.data?.text() || ''}; }
  event.waitUntil(self.registration.showNotification(payload.title || 'こどもケア', {
    body: payload.body || 'お知らせがあります',
    icon: payload.icon || undefined,
    tag: payload.tag || 'kodomo-care-push',
    data: {url: './'}
  }));
});
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(async clients => {
    for (const client of clients) { if ('focus' in client) return client.focus(); }
    return self.clients.openWindow('./');
  }));
});
