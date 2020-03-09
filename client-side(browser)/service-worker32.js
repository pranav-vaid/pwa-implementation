// Set this to true for production
var doCache = true;

// Name our cache
const CACHE_NAME = 'picwith-v5';

// Delete old caches that are not our current one!
self.addEventListener("activate", event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys()
      .then(keyList =>
        Promise.all(keyList.map(key => {
          if (!cacheWhitelist.includes(key)) {
            console.log('Deleting cache: ' + key)
            return caches.delete(key);
          }
        }))
      )
  );
});

// The first time the user starts up the PWA, 'install' is triggered.
self.addEventListener('install', function(event) {
  if (doCache) {
    const urlsToCache = [
                "/",
                "/wordpress/"
                // assets["main.js"]
              ]
    console.log('Attempting to install service worker and cache static assets');
    event.waitUntil(
      caches.open(CACHE_NAME)
        .then(function(cache) {
          // Get the assets manifest so we can see what our js file is named
          // This is because webpack hashes it
          return cache.addAll(urlsToCache);
        })
    );
  }
});

// When the webpage goes to fetch files, we intercept that request and serve up the matching files
// if we have them
self.addEventListener('fetch', function(event) {
    if (doCache) {
      event.respondWith(
          caches.match(event.request).then(function(response) {
              return fetch(event.request) || response;
          })
      );
    }
});

self.addEventListener('push', event => {
  let data = event.data.json();
  const options = {
    body: 'Non-Stop Spider-Man Series Announced by Marvel ',
    icon: 'images/notification-flat.png',
    image: 'images/notification.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url,
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {action: 'explore',
        title: 'Open',
        icon: 'images/checkmark.png'},
      {action: 'close',
        title: 'Close',
        icon: 'images/xmark.png'},
    ]
  }

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', event => {
  const notification = event.notification;
  const primaryKey = notification.data.primaryKey;
  let url = notification.data.url;
  const action = event.action;

  if (action === 'close') {
    // console.log(data);
    notification.close();
  } else {
    clients.openWindow(url);
    notification.close();
  }

  // TODO 5.3 - close all notifications when one is clicked

});

self.addEventListener('notificationclose', function(e) {
  var notification = e.notification;
  var primaryKey = notification.data.primaryKey;

  console.log('Closed notification: ' + primaryKey);
});