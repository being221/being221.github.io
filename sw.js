// Service Worker — 网络优先，离线兜底
const CACHE_NAME = 'being-homepage-v2';

// 安装
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// 激活：清理旧缓存
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) => {
      return Promise.all(names.map((name) => caches.delete(name)));
    })
  );
  self.clients.claim();
});

// 请求拦截：网络优先，拿不到再用缓存
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // 网络成功 → 更新缓存
        if (response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clone);
          });
        }
        return response;
      })
      .catch(() => {
        // 网络失败 → 用缓存兜底
        return caches.match(event.request);
      })
  );
});
