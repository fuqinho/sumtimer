<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue';
import { getAuth, onAuthStateChanged, type Unsubscribe } from '@firebase/auth';
import { useAuthStore } from '@/stores/auth-store';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();
let unsubscribe = null as Unsubscribe | null;

onMounted(() => {
  const auth = getAuth();
  console.log('App.vue onMounted. user:', auth.currentUser);
  if (auth.currentUser) {
    authStore.setCurrentUser(auth.currentUser);
  }
  unsubscribe = onAuthStateChanged(auth, (user) => {
    console.log('onAuthStateChanged. user:', user);
    authStore.setCurrentUser(user);
    if (!user) {
      router.push('/');
    }
  });
});

onBeforeUnmount(() => {
  console.log('App.vue onBeforeUnmount.');
  if (unsubscribe) {
    unsubscribe();
    unsubscribe = null;
    authStore.setCurrentUser(null);
  }
});
</script>

<template>
  <router-view />
</template>
