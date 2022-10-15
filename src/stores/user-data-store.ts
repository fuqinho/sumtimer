import { defineStore, storeToRefs } from 'pinia';
import { ref, watch } from 'vue';
import { useAuthStore } from 'stores/auth-store';
import {
  getFirestore,
  doc,
  onSnapshot,
  Unsubscribe,
  setDoc,
} from 'firebase/firestore';
import { presetUserDocumentData } from 'src/components/constants';
import { CategoryData, UserDocumentData } from 'src/components/models';

export const useUserDataStore = defineStore('userData', () => {
  const authStore = useAuthStore();
  const { uid } = storeToRefs(authStore);

  const categories = ref([] as CategoryData[]);
  let unsubscribe: Unsubscribe | null = null;

  onUpdateUser(uid.value);
  watch(uid, (uid) => {
    onUpdateUser(uid);
  });

  async function onUpdateUser(uid: string) {
    if (unsubscribe) {
      unsubscribe();
      unsubscribe = null;
    }
    if (!uid) {
      return;
    }
    console.log('updating uid to ', uid);
    const docRef = doc(getFirestore(), 'users', uid);

    unsubscribe = onSnapshot(docRef, {}, (snapshot) => {
      console.log('user doc onSnapshot callback invoked.');
      if (snapshot.exists()) {
        console.log('user doc snapshot exists.', snapshot.id);
        categories.value = (snapshot.data() as UserDocumentData).categories;
      } else {
        console.log('user doc snapshot DOES NOT exists.', snapshot.id);
        console.log('creating the data...');
        setDoc(docRef, presetUserDocumentData);
      }
    });
  }

  return { categories };
});
