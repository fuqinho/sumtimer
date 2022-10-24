import { boot } from 'quasar/wrappers';
import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_SUMTIMER_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_SUMTIMER_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_SUMTIMER_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_SUMTIMER_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_SUMTIMER_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_SUMTIMER_FIREBASE_APP_ID,
};

export default boot(({}) => {
  initializeApp(firebaseConfig);
});
