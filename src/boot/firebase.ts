import { boot } from 'quasar/wrappers';
import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: process.env.SUMTIMER_FIREBASE_API_KEY,
  authDomain: process.env.SUMTIMER_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.SUMTIMER_FIREBASE_PROJECT_ID,
  storageBucket: process.env.SUMTIMER_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.SUMTIMER_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.SUMTIMER_FIREBASE_APP_ID,
};

export default boot(({}) => {
  initializeApp(firebaseConfig);
});
