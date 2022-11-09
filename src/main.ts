import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { Quasar } from 'quasar';
import { initializeApp } from 'firebase/app';
import { createI18n } from 'vue-i18n';

// Import Quasar extra libraries.
import '@quasar/extras/material-icons/material-icons.css';
import '@quasar/extras/roboto-font/roboto-font.css';

// Import Quasar css.
import 'quasar/src/css/index.sass';

import App from './App.vue';
import router from './router';

import './assets/main.css';

// Firebase setup
const firebaseConfig = {
  apiKey: import.meta.env.VITE_SUMTIMER_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_SUMTIMER_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_SUMTIMER_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_SUMTIMER_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_SUMTIMER_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_SUMTIMER_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_SUMTIMER_FIREBASE_MEASUREMENT_ID,
};
initializeApp(firebaseConfig);

// i18n setup
import messages from '@/i18n';
export type MessageLanguages = keyof typeof messages;
export type MessageSchema = typeof messages['en-US'];
declare module 'vue-i18n' {
  export interface DefineLocaleMessage extends MessageSchema {}
  export interface DefineDateTimeFormat {}
  export interface DefineNumberFormat {}
}
const i18n = createI18n({
  locale: 'ja-JP',
  fallbackLocale: 'en-US',
  legacy: false,
  messages,
});

// Create Vue app
const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(Quasar, {
  plugins: {},
});
app.use(i18n);

app.mount('#app');
