<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue';
import { getAuth, onAuthStateChanged, Unsubscribe } from '@firebase/auth';
import { useAuthStore } from './stores/auth-store';

const authStore = useAuthStore();
let unsubscribe = null as Unsubscribe | null;

onMounted(() => {
  const auth = getAuth();
  unsubscribe = onAuthStateChanged(auth, (user) => {
    authStore.setCurrentUser(user);
  });
});

onBeforeUnmount(() => {
  if (unsubscribe) {
    unsubscribe();
    authStore.setCurrentUser(null);
  }
});
</script>

<template>
  <router-view />
</template>
