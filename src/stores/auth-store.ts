import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { User } from 'firebase/auth';

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null as User | null);
  const uid = ref('');
  const isSignedIn = ref(false);
  const userDisplayName = computed(() => {
    if (user.value && user.value.displayName) return user.value.displayName;
    return undefined;
  });
  const userProfilePicUrl = computed(() => {
    if (user.value && user.value.photoURL) return user.value.photoURL;
    return undefined;
  });

  function setCurrentUser(currentUser: User | null) {
    user.value = currentUser;
    uid.value = currentUser ? currentUser.uid : '';
    isSignedIn.value = !!currentUser;
  }

  return {
    user,
    uid,
    isSignedIn,
    userDisplayName,
    userProfilePicUrl,
    setCurrentUser,
  };
});
