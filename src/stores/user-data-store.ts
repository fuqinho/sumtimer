import { ref, watch } from 'vue';
import { defineStore, storeToRefs } from 'pinia';
import { useAuthStore } from 'src/stores/auth-store';

export const useUserDataStore = defineStore('userData', () => {
  const authStore = useAuthStore();
  const { user } = storeToRefs(authStore);
  const uid = ref('');

  uid.value = user.value ? user.value.uid : '';
  watch(user, (user) => {
    uid.value = user ? user.uid : '';
  });

  return {
    uid,
  };
});
