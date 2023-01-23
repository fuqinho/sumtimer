<script setup lang="ts">
import { onBeforeUnmount, onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { getAuth, onAuthStateChanged, type Unsubscribe } from '@firebase/auth';
import { useAuthStore } from '@/stores/auth-store';
import { useRouter } from 'vue-router';
import { useUserStore } from './stores/user-store';
import { storeToRefs } from 'pinia';

const { locale } = useI18n({ useScope: 'global' });
const authStore = useAuthStore();
const userStore = useUserStore();
const router = useRouter();

const { currentLocale } = storeToRefs(userStore);

let unsubscribe = null as Unsubscribe | null;

onMounted(() => {
  const auth = getAuth();
  console.log('App.vue onMounted. user:', auth.currentUser);
  if (auth.currentUser) {
    authStore.setCurrentUser(auth.currentUser);
  }
  unsubscribe = onAuthStateChanged(auth, (user) => {
    console.log('onAuthStateChanged. user:', user);
    authStore.setCurrentUser(user, true);
    if (!user) {
      router.push('/');
    }
  });

  locale.value = currentLocale.value;
  watch(currentLocale, (newLocale) => {
    if (locale.value != newLocale) {
      locale.value = newLocale;
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
