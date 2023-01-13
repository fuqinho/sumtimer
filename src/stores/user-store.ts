import type { UserDocumentData } from '@/types/documents';
import {
  doc,
  DocumentReference,
  getFirestore,
  onSnapshot,
  updateDoc,
  type Unsubscribe,
} from 'firebase/firestore';
import { defineStore, storeToRefs } from 'pinia';
import { useQuasar } from 'quasar';
import { computed, ref, watch } from 'vue';

import { useAuthStore } from './auth-store';

export const useUserStore = defineStore('users', () => {
  const authStore = useAuthStore();
  const $q = useQuasar();

  const { uid } = storeToRefs(authStore);
  const docRef = computed(
    () =>
      doc(
        getFirestore(),
        'users',
        uid.value
      ) as DocumentReference<UserDocumentData>
  );

  const browserLocale = computed(() => {
    return $q.lang.getLocale() || 'en-US';
  });
  const currentLocale = ref(browserLocale.value);

  let unsubscribe = null as Unsubscribe | null;
  onUpdateUid();
  watch(uid, onUpdateUid);

  function onUpdateUid() {
    if (uid.value) {
      startWatchCache();
    } else {
      stopWatchCache();
    }
  }

  function startWatchCache() {
    stopWatchCache();
    unsubscribe = onSnapshot(docRef.value, (snapshot) => {
      if (snapshot.exists()) {
        currentLocale.value = snapshot.data().locale || browserLocale.value;
      } else {
        currentLocale.value = browserLocale.value;
      }
    });
  }

  function stopWatchCache() {
    if (unsubscribe) {
      unsubscribe();
      unsubscribe = null;
    }
    currentLocale.value = browserLocale.value;
  }

  async function setLocale(loc: string) {
    await updateDoc(docRef.value, { locale: loc });
  }

  return {
    currentLocale,
    setLocale,
  };
});
