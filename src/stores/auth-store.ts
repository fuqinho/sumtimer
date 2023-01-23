import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import type { User } from 'firebase/auth';

export const useAuthStore = defineStore('auth', () => {
  console.log('Setup authStore start');
  const user = ref(null as User | null);
  const uid = ref('');
  const isSignedIn = ref(false);
  const willBeSignedIn = ref(localStorage.getItem('hasSignedIn') === 'yes');
  const userDisplayName = computed(() => {
    if (user.value && user.value.displayName) return user.value.displayName;
    return undefined;
  });
  const userProfilePicUrl = computed(() => {
    if (user.value && user.value.photoURL) return user.value.photoURL;
    return undefined;
  });
  const userEmail = computed(() => {
    return user.value && user.value.email;
  });

  function setCurrentUser(currentUser: User | null, byAuthChanged = false) {
    user.value = currentUser;
    uid.value = currentUser ? currentUser.uid : '';
    isSignedIn.value = !!currentUser;
    if (byAuthChanged) {
      willBeSignedIn.value = !!currentUser;
      localStorage.setItem('hasSignedIn', currentUser ? 'yes' : 'no');
    }
  }

  console.log('Setup authStore end');
  return {
    user,
    uid,
    isSignedIn,
    willBeSignedIn,
    userDisplayName,
    userProfilePicUrl,
    userEmail,
    setCurrentUser,
  };
});
