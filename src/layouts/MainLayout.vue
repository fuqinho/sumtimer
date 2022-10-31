<script setup lang="ts">
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import { storeToRefs } from 'pinia';
import { useAuthStore } from 'stores/auth-store';

const authStore = useAuthStore();
const { isSignedIn, userDisplayName, userProfilePicUrl } =
  storeToRefs(authStore);

function signInWithGoolge() {
  signInWithPopup(getAuth(), new GoogleAuthProvider());
}

function signOutUser() {
  signOut(getAuth());
}
</script>

<template>
  <q-layout view="hHh lpR fFf">
    <q-header reveal bordered class="bg-primary text-white" height-hint="98">
      <q-toolbar>
        <q-toolbar-title>
          <q-avatar>
            <img src="https://cdn.quasar.dev/logo-v2/svg/logo-mono-white.svg" />
          </q-avatar>
          Sumtimer
        </q-toolbar-title>

        <q-item v-if="isSignedIn" clickable v-ripple>
          <q-item-section v-if="!!userProfilePicUrl" avatar>
            <q-avatar> <img :src="userProfilePicUrl" /> </q-avatar>
          </q-item-section>
          <q-item-section>{{ userDisplayName }}</q-item-section>
          <q-menu>
            <q-list style="min-width: 100px">
              <q-item clickable v-close-popup>
                <q-item-section @click="signOutUser"> Sign out </q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-item>

        <q-btn v-else color="primary" label="Sign in">
          <q-menu>
            <q-list style="min-width: 100px">
              <q-item clickable v-close-popup>
                <q-item-section @click="signInWithGoolge">
                  Sign in with Google
                </q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </q-toolbar>

      <q-tabs align="left">
        <q-route-tab to="/" label="Home" />
        <q-route-tab to="/activities" label="Activities" />
        <q-route-tab to="/records" label="Records" />
        <q-route-tab to="/history" label="History" />
        <q-route-tab to="/settings" label="Settings" />
      </q-tabs>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>
