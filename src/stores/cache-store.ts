import { computed, ref, watch } from 'vue';
import { defineStore, storeToRefs } from 'pinia';
import {
  collection,
  deleteField,
  doc,
  DocumentReference,
  getFirestore,
  onSnapshot,
  type Unsubscribe,
  WriteBatch,
  Timestamp,
  increment,
  FieldValue,
  query,
  where,
  getDocs,
  QuerySnapshot,
  setDoc,
} from 'firebase/firestore';
import type {
  ActivityDocumentData,
  CachedCategory,
  CachedActivity,
  CacheDocumentData,
  CachedCategoryData,
  CachedActivityData,
  CategoryDocumentData,
  RecordDocumentData,
} from '@/types/documents';
import { useAuthStore } from '@/stores/auth-store';

export const useCacheStore = defineStore('cache', () => {
  // =========================== Use stores/composables ==========================
  const authStore = useAuthStore();

  // =========================== Refs ============================================
  const { uid } = storeToRefs(authStore);
  const cache = ref(null as CacheDocumentData | null);

  // =========================== Computed properties =============================
  const db = computed(() => getFirestore());
  const colRef = computed(() => collection(db.value, 'cache'));
  const docRef = computed(() => doc(colRef.value, uid.value));
  const categories = computed(() => {
    if (!cache.value) return [] as CachedCategory[];
    return Object.entries(cache.value.categories)
      .map((item) => ({ id: item[0], data: item[1] }))
      .sort((a, b) => a.data.order - b.data.order) as CachedCategory[];
  });
  const idToCategory = computed(() => {
    return cache.value ? cache.value.categories : {};
  });
  const activities = computed(() => {
    if (!cache.value) return [] as CachedActivity[];
    return Object.entries(cache.value.activities)
      .map((item) => ({ id: item[0], data: item[1] }))
      .sort(
        (a, b) => b.data.updated.toMillis() - a.data.updated.toMillis()
      ) as CachedActivity[];
  });
  const idToActivity = computed(() => {
    return cache.value ? cache.value.activities : {};
  });

  // =========================== Methods =========================================
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
    data: ActivityDocumentData
  ) {
    if (!cache.value) return;
    if (cache.value.activities[aid]) {
      console.error('Trying to add an activity which is already in cache.');
      return;
    }
    batch.update(docRef.value, {
      [`activities.${aid}`]: {
        label: data.label,
        cid: data.cid,
        duration: 0,
        count: 0,
        updated: data.updated,
      },
    });
  }

  function onActivityDeleted(batch: WriteBatch, aid: string) {
    if (!cache.value) return;
    if (!cache.value.activities[aid]) {
      console.error('Trying to delete an activity which is not in cache.');
      return;
    }
    batch.update(docRef.value, {
      [`activities.${aid}`]: deleteField(),
    });
  }

  function onActivityUpdated(
    batch: WriteBatch,
    aid: string,
    before: ActivityDocumentData,
    after: ActivityDocumentData
  ) {
    if (!cache.value) return;
    if (!cache.value.activities[aid]) {
      console.error('Trying to update an activity which is not in cache.');
      return;
    }
    const change = {} as { [key: string]: string | Timestamp };
    if (before.cid !== after.cid) change[`activities.${aid}.cid`] = after.cid;
    if (before.label !== after.label)
      change[`activities.${aid}.label`] = after.label;
    if (before.updated !== after.updated)
      change[`activities.${aid}.updated`] = after.updated;
    batch.update(docRef.value, change);
  }

  function onRecordAdded(
    batch: WriteBatch,
    rid: string,
    data: RecordDocumentData
  ) {
    if (!cache.value) return;
    if (!cache.value.activities[data.aid]) {
      console.error('Trying to add a record whose activity is not in cache');
      return;
    }
    const aid = data.aid;
    const change = {} as { [key: string]: FieldValue };
    change[`activities.${aid}.duration`] = increment(data.duration);
    change[`activities.${aid}.count`] = increment(1);
    batch.update(docRef.value, change);
  }

  function onRecordDeleted(
    batch: WriteBatch,
    rid: string,
    data: RecordDocumentData
  ) {
    if (!cache.value) return;
    if (!cache.value.activities[data.aid]) {
      console.error('Trying to delete a record whose activity is not in cache');
      return;
    }
    const aid = data.aid;
    const change = {} as { [key: string]: FieldValue };
    change[`activities.${aid}.duration`] = increment(-data.duration);
    change[`activities.${aid}.count`] = increment(-1);
    batch.update(docRef.value, change);
  }

  function onRecordUpdated(
    batch: WriteBatch,
    rid: string,
    oldData: RecordDocumentData,
    newData: RecordDocumentData
  ) {
    if (!cache.value) return;
    if (!cache.value.activities[newData.aid]) {
      console.error('Trying to update a record whose activity is not in cache');
      return;
    }
    if (newData.aid != oldData.aid) {
      onRecordDeleted(batch, rid, oldData);
      onRecordAdded(batch, rid, newData);
    } else {
      const aid = newData.aid;
      const change = {} as { [key: string]: FieldValue };
      change[`activities.${aid}.duration`] = increment(
        newData.duration - oldData.duration
      );
      batch.update(docRef.value, change);
    }
  }

  async function recomputeCache() {
    const docData = {
      categories: {} as { [key: string]: CachedCategoryData },
      activities: {} as { [key: string]: CachedActivityData },
    } as CacheDocumentData;

    // Read all categories from collection.
    const snapCats = (await getDocs(
      query(
        collection(getFirestore(), 'categories'),
        where('uid', '==', uid.value)
      )
    )) as QuerySnapshot<CategoryDocumentData>;
    for (const cat of snapCats.docs) {
      docData.categories[cat.id] = {
        label: cat.data().label,
        color: cat.data().color,
        order: cat.data().order,
      };
    }
    // Read all activities from collection.
    const snapActs = (await getDocs(
      query(
        collection(getFirestore(), 'activities'),
        where('uid', '==', uid.value)
      )
    )) as QuerySnapshot<ActivityDocumentData>;
    for (const act of snapActs.docs) {
      docData.activities[act.id] = {
        label: act.data().label,
        cid: act.data().cid,
        duration: 0,
        count: 0,
        updated: act.data().updated,
      };
    }
    // Read all records from collection.
    const snapRecs = (await getDocs(
      query(
        collection(getFirestore(), 'records'),
        where('uid', '==', uid.value)
      )
    )) as QuerySnapshot<RecordDocumentData>;
    for (const rec of snapRecs.docs) {
      const aid = rec.data().aid;
      docData.activities[aid].duration += rec.data().duration;
      docData.activities[aid].count++;
    }
    // Replace the cache with the newly computed one.
    await setDoc(docRef.value, docData);
  }

  // =========================== Additional setup ================================
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
    recomputeCache,
  };
});
