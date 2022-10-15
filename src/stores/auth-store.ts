import { defineStore } from 'pinia';
import { ref } from 'vue';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

export const useAuthStore = defineStore('auth', () => {
  const isUserSignedIn = ref(false);
  const isAnonymous = ref(false);
  const userDisplayName = ref('');
  const userProfilePicUrl = ref('');
  const uid = ref('');

  onAuthStateChanged(getAuth(), (user) => {
    isUserSignedIn.value = !!user;
    if (user) {
      isAnonymous.value = user.isAnonymous;
      userDisplayName.value = user.displayName ? user.displayName : 'Anonymous';
      userProfilePicUrl.value = user.photoURL ? user.photoURL : '';
      uid.value = user.uid;
    }
  });

  return {
    isUserSignedIn,
    userDisplayName,
    userProfilePicUrl,
    uid,
  };
});
