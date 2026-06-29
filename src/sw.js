/// <reference lib="webworker" />
/* eslint-disable no-restricted-globals */

import { clientsClaim } from 'workbox-core';
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';

// 声明这是一个 service worker（workbox 会注入清单到这里）
// self.__WB_MANIFEST

// 激活后立即接管所有客户端
clientsClaim();

// 清理旧的缓存
cleanupOutdatedCaches();

// 预缓存所有静态资源
precacheAndRoute(self.__WB_MANIFEST);

// 处理推送通知
self.addEventListener('push', (event) => {
  console.log('[Service Worker] 收到推送:', event);

  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body || '冰箱里有食材快过期了！',
    icon: data.icon || '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/',
    },
    actions: [
      { action: 'open', title: '打开应用' },
      { action: 'close', title: '关闭' },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(data.title || '🧊 冰箱遗书', options)
  );
});

// 处理通知点击
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] 通知被点击:', event);

  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // 如果已经有窗口打开，聚焦到它
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      // 否则打开新窗口
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// 安装事件
self.addEventListener('install', (event) => {
  console.log('[Service Worker] 安装中...');
  self.skipWaiting();
});

// 激活事件
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] 激活中...');
  event.waitUntil(clients.claim());
});
