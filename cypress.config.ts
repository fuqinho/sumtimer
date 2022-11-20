import { defineConfig } from 'cypress';
import admin from 'firebase-admin';
import { plugin as cypressFirebasePlugin } from 'cypress-firebase';
require('dotenv').config();

export default defineConfig({
  e2e: {
    specPattern: 'cypress/e2e/**/*.{cy,spec}.{js,jsx,ts,tsx}',
    baseUrl: 'http://localhost:4173',
    supportFile: 'cypress/support/e2e.ts',
    setupNodeEvents(on, config) {
      config.env = process.env;
      cypressFirebasePlugin(on, config, admin);
    },
  },
  env: {
    TEST_UID: 'eLwIt5JlzUA3WVTOOyptTxTrO8Cm',
  },
});
