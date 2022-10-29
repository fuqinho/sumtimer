<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue';
import { getAuth, onAuthStateChanged, Unsubscribe } from '@firebase/auth';
import { useAuthStore } from 'src/stores/auth-store';

const authStore = useAuthStore();
let unsubscribe = null as Unsubscribe | null;

onMounted(() => {
  const auth = getAuth();
  console.log('App.vue onMounted. user:', auth.currentUser);
  unsubscribe = onAuthStateChanged(auth, (user) => {
    console.log('onAuthStateChanged. user:', user);
    authStore.setCurrentUser(user);
  });
});

onBeforeUnmount(() => {
  console.log('App.vue onBeforeUnmount.');
  if (unsubscribe) {
    unsubscribe();
    authStore.setCurrentUser(null);
  }
});
</script>

<template>
  <router-view />
</template>
