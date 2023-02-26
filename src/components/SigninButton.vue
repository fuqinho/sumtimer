<script setup lang="ts">
import { useServerConfigStore } from '@/stores/server-config-store';
import { getAuth, GoogleAuthProvider, signInWithPopup } from '@firebase/auth';
import { storeToRefs } from 'pinia';

const serverConfigStore = useServerConfigStore();
const { signupDisabled } = storeToRefs(serverConfigStore);

function signInWithGoolge() {
  signInWithPopup(getAuth(), new GoogleAuthProvider());
}
</script>

<template>
  <q-btn
    id="btn-signin"
    :disable="signupDisabled"
    color="primary"
    label="Sign in"
  >
    <q-menu>
      <q-list style="min-width: 100px">
        <q-item v-close-popup clickable>
          <q-item-section @click="signInWithGoolge">
            Sign in with Google
          </q-item-section>
        </q-item>
      </q-list>
    </q-menu>
  </q-btn>
</template>
