import { ref, watch } from 'vue';
import { defineStore, storeToRefs } from 'pinia';
import { useAuthStore } from 'stores/auth-store';
import {
  getFirestore,
  doc,
  onSnapshot,
  Unsubscribe,
  setDoc,
  updateDoc,
  addDoc,
  collection,
  deleteField,
  Timestamp,
} from 'firebase/firestore';
import {
  presetActivities,
  presetUserDocumentData,
} from 'src/components/constants';
import {
  CategoryData,
  OngoingRecord,
  UserDocumentData,
} from 'src/components/models';

export const useUserDataStore = defineStore('userData', () => {
  const authStore = useAuthStore();
  const { uid } = storeToRefs(authStore);

  const categories = ref([] as CategoryData[]);
  const ongoing = ref(undefined as OngoingRecord | undefined);
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

    unsubscribe = onSnapshot(docRef, {}, async (snapshot) => {
      console.log('user doc onSnapshot callback invoked.');
      if (snapshot.exists()) {
        console.log('user doc snapshot exists.', snapshot.id);
        const userData = snapshot.data() as UserDocumentData;
        categories.value = userData.categories;
        ongoing.value = userData.ongoing;
      } else {
        console.log('user doc snapshot DOES NOT exists.', snapshot.id);
        await setupPresetUserData(uid);
      }
    });
  }

  async function setupPresetUserData(uid: string) {
    console.log('creating the data...');

    // Preset categories.
    await setDoc(doc(getFirestore(), 'users', uid), presetUserDocumentData);
    console.log('setDoc done');
    // Preset activities.
    for (const activity of presetActivities) {
      console.log('adding activity', activity.label);
      await addDoc(collection(getFirestore(), 'activities'), {
        uid: uid,
        label: activity.label,
        cid: activity.cid,
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
