importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js');

firebase.initializeApp({
  apiKey: "AIzaSyBOUB_QdChY73XkNzS-ol7G-6U9EM2gO_Q",
  authDomain: "aadl-3.firebaseapp.com",
  projectId: "aadl-3",
  storageBucket: "aadl-3.appspot.com",
  messagingSenderId: "1005241553495",
  appId: "1:1005241553495:web:7e100f2bca1a2fc8e44912",
  measurementId: "G-RNMDQJLV93"
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('Received background message:', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icon.png',
    vibrate: [200, 100, 200]
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', function(event) {
  const clickAction = event.notification.data.click_action;

  event.notification.close(); // Close the notification

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
      // If there is an open window/tab, focus it
      for (var i = 0; i < windowClients.length; i++) {
        var client = windowClients[i];
        if (client.url === clickAction && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise, open a new tab/window with the click_action URL
      if (clients.openWindow) {
        return clients.openWindow(clickAction);
      }
    })
  );
});

// Make sure you handle incoming messages to display notifications
self.addEventListener('push', function(event) {
  const data = event.data.json();

  const options = {
    body: data.notification.body,
    data: {
      click_action: data.data.click_action // Ensure click_action is included in the data
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.notification.title, options)
  );
});
