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
    icon: './icon.png',
    vibrate: [200, 100, 200]
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
