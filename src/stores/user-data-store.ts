import { defineStore, storeToRefs } from 'pinia';
import { ref, watch } from 'vue';
import { useAuthStore } from 'stores/auth-store';
import {
  getFirestore,
  doc,
  onSnapshot,
  Unsubscribe,
  setDoc,
  updateDoc,
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

  function addCategory(label: string, color: string) {
    // random generated id to the category.
    const id = Math.random().toString(36).slice(2);

    const newCategories = categories.value;
    newCategories.push({ id: id, label: label, color: color });

    const docRef = doc(getFirestore(), 'users', uid.value);
    updateDoc(docRef, { categories: newCategories });
  }

  function removeCategory(id: string) {
    const newCategories = categories.value.filter((category) => {
      return category.id != id;
    });
    const docRef = doc(getFirestore(), 'users', uid.value);
    updateDoc(docRef, { categories: newCategories });
  }

  return { uid, categories, addCategory, removeCategory };
});
