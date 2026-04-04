// 强制立即接管，这是 PWA 消除网址的关键
self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
});

// 处理推送通知（如果有服务器推送）
self.addEventListener('push', function(event) {
    const data = event.data.json();
    const title = data.title || '新消息';
    const options = {
        body: data.body,
        icon: data.icon || 'https://iili.io/BHoJDiX.png',
        badge: 'https://iili.io/BHoJDiX.png',
        vibrate: [200, 100, 200],
        tag: 'msg_' + Date.now()
    };
    event.waitUntil(self.registration.showNotification(title, options));
});

// 点击通知时，直接激活已经打开的 App 窗口，而不是新开一个
self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
            if (clientList.length > 0) {
                return clientList[0].focus();
            }
            return clients.openWindow('/');
        })
    );
});

self.addEventListener('fetch', (event) => {
    // 【关键修复】如果是外部链接（比如QQ音乐、API请求等），直接交还给浏览器自己处理
    // 这样能保留防盗链破解，也不会把音频流截断导致播放失败
    if (new URL(event.request.url).origin !== self.location.origin) {
        return;
    }

    // 你自己网站的请求，依然走原来的离线保护逻辑
    event.respondWith(
        fetch(event.request).catch(() => {
            return new Response('请检查网络连接');
        })
    );
});