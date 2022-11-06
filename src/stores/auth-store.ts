import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { User } from 'firebase/auth';

export const useAuthStore = defineStore('auth', () => {
  console.log('Setup authStore start');
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
  const userEmail = computed(() => {
    return user.value && user.value.email;
  });

  function setCurrentUser(currentUser: User | null) {
    user.value = currentUser;
    uid.value = currentUser ? currentUser.uid : '';
    isSignedIn.value = !!currentUser;
  }

  console.log('Setup authStore end');
  return {
    user,
    uid,
    isSignedIn,
    userDisplayName,
    userProfilePicUrl,
    userEmail,
    setCurrentUser,
  };
});
