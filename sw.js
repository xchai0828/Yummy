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
        icon: data.icon || 'https://cdn-icons-png.flaticon.com/128/3132/3132693.png',
        badge: 'https://cdn-icons-png.flaticon.com/128/3132/3132693.png',
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
    // 直接放行网络请求，但如果网络失败则返回一个空的离线响应，防止 iOS 报错
    event.respondWith(
        fetch(event.request).catch(() => {
            return new Response('请检查网络连接');
        })
    );
});