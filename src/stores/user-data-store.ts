import { ref, watch } from 'vue';
import { defineStore, storeToRefs } from 'pinia';
import {
  getFirestore,
  doc,
  onSnapshot,
  Unsubscribe,
  updateDoc,
  collection,
  deleteField,
  Timestamp,
  runTransaction,
} from 'firebase/firestore';
import {
  CategoryData,
  OngoingRecord,
  UserDocumentData,
} from 'src/common/types';
import { useAuthStore } from 'src/stores/auth-store';

export const useUserDataStore = defineStore('userData', () => {
  const authStore = useAuthStore();
  const { user } = storeToRefs(authStore);
  const uid = ref('');

  const categories = ref([] as CategoryData[]);
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

  function getCategoryData(id: string): CategoryData | null {
    for (const category of categories.value) {
      if (category.id === id) {
        return category;
      }
    }
    return null;
  }

  async function startOngoingActivity(aid: string) {
    console.log('startOngoingActivity', aid);
    const docRef = doc(getFirestore(), 'users', uid.value);
    const ongoing = {
      aid: aid,
      start: Timestamp.now(),
    };
    await updateDoc(docRef, { ongoing: ongoing });
  }

  async function finishOngoingActivity() {
    if (!ongoing.value) return;

    console.log('finishOngoingActivity');
    const docRef = doc(getFirestore(), 'users', uid.value);
    await updateDoc(docRef, { ongoing: deleteField() });
  }

  return {
    uid,
    categories,
    ongoing,

    addCategory,
    removeCategory,
    getCategoryData,
    startOngoingActivity,
    finishOngoingActivity,
  };
});
