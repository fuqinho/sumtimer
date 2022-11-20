// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

import './commands';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import { attachCustomCommands } from 'cypress-firebase';

const firebaseConfig = {
  projectId: 'demo-sumtimer',
  apiKey: '.',
  authDomain: '.',
};
firebase.initializeApp(firebaseConfig);
firebase.firestore().settings({ host: 'localhost:8080', ssl: false });
firebase.auth().useEmulator('http://localhost:9099');

attachCustomCommands({ Cypress, cy, firebase });
