import { computed, ref, watch } from 'vue';
import { defineStore, storeToRefs } from 'pinia';
import {
  collection,
  deleteField,
  doc,
  DocumentReference,
  getFirestore,
  onSnapshot,
  Unsubscribe,
  WriteBatch,
} from 'firebase/firestore';
import {
  ActivityDocumentData,
  CacheDocumentData,
  CategoryDocumentData,
  RecordDocumentData,
} from 'src/types/documents';
import { useAuthStore } from 'src/stores/auth-store';

export const useCacheStore = defineStore('cache', () => {
  const authStore = useAuthStore();
  const { uid } = storeToRefs(authStore);

  const cache = ref(null as CacheDocumentData | null);

  const db = computed(() => getFirestore());
  const colRef = computed(() => collection(db.value, 'cache'));
  const docRef = computed(() => doc(colRef.value, uid.value));

  const categories = computed(() => {
    if (!cache.value) return [];
    return Object.entries(cache.value.categories)
      .map((item) => ({ id: item[0], data: item[1] }))
      .sort((a, b) => a.data.order - b.data.order);
  });

  const idToCategory = computed(() => {
    return cache.value ? cache.value.categories : {};
  });

  const activities = computed(() => {
    if (!cache.value) return [];
    return Object.entries(cache.value.activities)
      .map((item) => ({ id: item[0], data: item[1] }))
      .sort((a, b) => b.data.updated.toMillis() - a.data.updated.toMillis());
  });

  const idToActivity = computed(() => {
    return cache.value ? cache.value.activities : {};
  });

  function onCategoryAdded(
    batch: WriteBatch,
    cid: string,
    data: CategoryDocumentData
  ) {
    if (!cache.value) return;
    if (cache.value.categories[cid]) {
      console.error('Trying to add a category which is already in cache.');
      return;
    }
    batch.update(docRef.value, {
      [`categories.${cid}`]: {
        label: data.label,
        color: data.color,
        order: data.order,
        duration: 0,
      },
    });
  }

  function onCategoryDeleted(batch: WriteBatch, cid: string) {
    if (!cache.value) return;
    if (!cache.value.categories[cid]) {
      console.error('Trying to remove a category which is not in cache.');
      return;
    }
    batch.update(docRef.value, {
      [`categories.${cid}`]: deleteField(),
    });
  }

  function onCategoryUpdated(
    batch: WriteBatch,
    cid: string,
    before: CategoryDocumentData,
    after: CategoryDocumentData
  ) {
    if (!cache.value) return;
    if (!cache.value.categories[cid]) {
      console.error('Trying to update a category which is not in cache.');
      return;
    }
    batch.update(docRef.value, {
      [`categories.${cid}`]: {
        label: after.label,
        color: after.color,
        order: after.order,
      },
    });
  }

  function onActivityAdded(
    batch: WriteBatch,
    aid: string,
    after: ActivityDocumentData
  ) {
    console.log('onActivityUpdated');
  }

  function onActivityDeleted(
    batch: WriteBatch,
    aid: string,
    before: ActivityDocumentData
  ) {
    console.log('onActivityUpdated');
  }

  function onActivityUpdated(
    batch: WriteBatch,
    aid: string,
    before: ActivityDocumentData,
    after: ActivityDocumentData
  ) {
    console.log('onActivityUpdated');
  }

  async function onRecordAdded(rid: string, data: RecordDocumentData) {
    console.log('onRecordAdded');
  }

  async function onRecordDeleted(rid: string) {
    console.log('onRecordDeleted');
  }

  async function onRecordUpdated(
    rid: string,
    before: RecordDocumentData,
    after: RecordDocumentData
  ) {
    console.log('onRecordUpdated');
  }

  let unsubscribe = null as Unsubscribe | null;
  onUpdateUid();
  watch(uid, onUpdateUid);

  function onUpdateUid() {
    console.log('cacheStore::onUpdateUid():', uid.value);
    if (uid.value) {
      startWatchCache(uid.value);
    } else {
      stopWatchCache();
    }
  }

  function startWatchCache(uid: string) {
    stopWatchCache();
    const colRef = collection(getFirestore(), 'cache');
    const docRef = doc(colRef, uid) as DocumentReference<CacheDocumentData>;
    unsubscribe = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        cache.value = snapshot.data();
      } else {
        cache.value = null;
      }
    });
  }

  function stopWatchCache() {
    if (unsubscribe) {
      unsubscribe();
      unsubscribe = null;
    }
    cache.value = null;
  }

  return {
    cache,
    categories,
    idToCategory,
    activities,
    idToActivity,
    onCategoryAdded,
    onCategoryDeleted,
    onCategoryUpdated,
    onActivityAdded,
    onActivityDeleted,
    onActivityUpdated,
    onRecordAdded,
    onRecordDeleted,
    onRecordUpdated,
  };
});
