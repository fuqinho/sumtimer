import { ref, watch } from 'vue';
import { defineStore, storeToRefs } from 'pinia';
import { getFirestore, doc, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { CategoryDoc, OngoingRecord, UserDocumentData } from 'src/common/types';
import { useAuthStore } from 'src/stores/auth-store';

export const useUserDataStore = defineStore('userData', () => {
  const authStore = useAuthStore();
  const { user } = storeToRefs(authStore);
  const uid = ref('');

  const categories = ref([] as CategoryDoc[]);
  const ongoing = ref(undefined as OngoingRecord | undefined);

  let unsubscribe = null as Unsubscribe | null;
  onUpdateUser(user.value ? user.value.uid : '');
  watch(user, (user) => {
    uid.value = user ? user.uid : '';
    onUpdateUser(user ? user.uid : '');
  });

  function onUpdateUser(uid: string) {
    if (!uid) {
      if (unsubscribe) {
        unsubscribe();
        unsubscribe = null;
        categories.value = [];
        ongoing.value = undefined;
      }
    } else {
      // Start watching user data in 'users' collection.
      const docRef = doc(getFirestore(), 'users', uid);
      unsubscribe = onSnapshot(docRef, {}, async (snapshot) => {
        if (snapshot.exists()) {
          const userData = snapshot.data() as UserDocumentData;
          categories.value = userData.categories;
          ongoing.value = userData.ongoing;
        }
      });
    }
  }

  return {
    uid,
    categories,
    ongoing,
  };
});
