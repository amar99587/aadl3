// Initialize Firebase (replace with your config)
const firebaseConfig = {
    apiKey: "AIzaSyBOUB_QdChY73XkNzS-ol7G-6U9EM2gO_Q",
    authDomain: "aadl-3.firebaseapp.com",
    projectId: "aadl-3",
    storageBucket: "aadl-3.appspot.com",
    messagingSenderId: "1005241553495",
    appId: "1:1005241553495:web:7e100f2bca1a2fc8e44912",
    measurementId: "G-RNMDQJLV93"
};
firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// Request permission and get token
async function requestNotificationPermission() {
  try {
    const permission = await Notification.requestPermission();
    console.log(permission);
    if (permission === 'granted') {
      const token = await messaging.getToken({ vapidKey: 'BH6kntdySarAQtCOJ-zzzPJh6_b-_re3e2q2GVDeikiUMOaTrZbKGA75miBPIa3lrR9lxzBIneKyZ0w3RPoTtME' });
      console.log('FCM Token:', token);
      return token;
    } else {
      throw new Error('Notification permission denied');
    }
  } catch (error) {
    console.error('Error getting permission or token:', error);
    throw error;
  }
}

document.getElementById('register').addEventListener('click', async () => {
  const email = document.getElementById('email').value;
  if (!email) {
    alert('Please enter your email');
    return;
  }

  try {
    const token = await requestNotificationPermission();
    console.log({ email, fcmToken: token });
    const response = await fetch('https://aadl3.onrender.com/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, fcmToken: token }),
    });

    if (response.ok) {
      alert('Registered successfully! You will be notified when the AADL website is online.');
    } else {
      alert('Registration failed. Please try again.');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('An error occurred. Please try again.');
  }
});

// Handle foreground messages
messaging.onMessage((payload) => {
  console.log('Message received. ', payload);
  // You can customize how to show the notification here
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icon.png'
  };
  new Notification(notificationTitle, notificationOptions);
});

// Check if the browser supports service workers
if ('serviceWorker' in navigator) {
  console.log("Register the service worker")
  navigator.serviceWorker.register('./firebase-messaging-sw.js')
    .then((registration) => {
      console.log('Service worker registered:', registration);
    })
    .catch((error) => {
      console.error('Service worker registration failed:', error);
    });
} else {
  console.log('Service workers are not supported.');
}