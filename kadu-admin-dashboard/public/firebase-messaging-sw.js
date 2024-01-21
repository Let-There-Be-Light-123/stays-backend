importScripts('https://www.gstatic.com/firebasejs/9.1.3/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.1.3/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyB15uH0gOosZhBCD-tpon1rcAE6SadH3Yc",
    authDomain: "kadu-booking-app.firebaseapp.com",
    projectId: "kadu-booking-app",
    storageBucket: "kadu-booking-app.appspot.com",
    messagingSenderId: "204087788099",
    appId: "1:204087788099:web:d25deb24a86c1464dacaf6",
    measurementId: "G-C9WYN2859H"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    // Handle background message
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
});