import { boot } from 'quasar/wrappers';
import { initializeApp } from 'firebase/app';
import {
  connectFirestoreEmulator,
  getFirestore,
  initializeFirestore,
} from 'firebase/firestore';
import { connectAuthEmulator, getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_SUMTIMER_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_SUMTIMER_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_SUMTIMER_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_SUMTIMER_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_SUMTIMER_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_SUMTIMER_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_SUMTIMER_FIREBASE_MEASUREMENT_ID,
};

export default boot(({}) => {
  const app = initializeApp(firebaseConfig);

  if (import.meta.env.DEV) {
    const db = initializeFirestore(app, {
      experimentalForceLongPolling: true,
    });
    connectFirestoreEmulator(getFirestore(app), 'localhost', 8080);
    connectAuthEmulator(getAuth(app), 'http://localhost:9099');
  }
});
