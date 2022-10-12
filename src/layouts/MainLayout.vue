<script setup lang="ts">
import { ref } from 'vue';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';

const isUserSignedIn = ref(false);
const userDisplayName = ref('Anonymous');
const userProfilePicUrl = ref('');

function signInWithGoolge() {
  const provider = new GoogleAuthProvider();
  signInWithPopup(getAuth(), provider);
}

function signOutUser() {
  signOut(getAuth());
}

onAuthStateChanged(getAuth(), (user) => {
  console.log(user);
  const auth = getAuth();
  isUserSignedIn.value = !!auth.currentUser;
  if (auth && auth.currentUser) {
    userDisplayName.value = auth.currentUser.displayName
      ? auth.currentUser.displayName
      : 'Anonymous';
    userProfilePicUrl.value = auth.currentUser.photoURL
      ? auth.currentUser.photoURL
      : '';
  }
});
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

        <q-item v-if="isUserSignedIn" clickable v-ripple>
          <q-item-selection class="q-pr-md">
            <q-avatar> <img :src="userProfilePicUrl" /> </q-avatar>
          </q-item-selection>
          <q-item-selection>
            <q-item-label>{{ userDisplayName }}</q-item-label>
            <q-item-label caption>Ready to record</q-item-label>
          </q-item-selection>
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
        <q-route-tab to="/categories" label="Categories" />
        <q-route-tab to="/activities" label="Activities" />
        <q-route-tab to="/records" label="Records" />
      </q-tabs>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>
