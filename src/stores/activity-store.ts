import { ref, computed, watch } from 'vue';
import { defineStore, storeToRefs } from 'pinia';
import {
  getFirestore,
  onSnapshot,
  collection,
  query,
  where,
  updateDoc,
  doc,
  orderBy,
  Timestamp,
  writeBatch,
  getDocs,
  QuerySnapshot,
  Unsubscribe,
  DocumentReference,
  getDoc,
  WriteBatch,
} from 'firebase/firestore';
import {
  ActivityDocumentData,
  ActivityDoc,
  RecordDocumentData,
  ActivityChange,
} from 'src/types/documents';
import { PortableActivity } from 'src/types/portable';
import { useAuthStore } from 'src/stores/auth-store';
import { useCacheStore } from './cache-store';

export const useActivityStore = defineStore('activities', () => {
  console.log('Setup activityStore start');
  const authStore = useAuthStore();
  const cacheStore = useCacheStore();
  const { uid } = storeToRefs(authStore);
  const activities = ref([] as ActivityDoc[]);
  const idToActivity = computed(() => {
    return activities.value.reduce((res, item) => {
      res[item.id] = item.data;
      return res;
    }, {} as { [key: string]: ActivityDocumentData });
  });

  let unsubscribe = null as Unsubscribe | null;
  onUpdateUid();
  watch(uid, onUpdateUid);

  function onUpdateUid() {
    console.log('activityStore::onUpdateUid():', uid.value);
    if (uid.value) {
      startWatchActivities(uid.value);
    } else {
      stopWatchActivities();
    }
  }

  function startWatchActivities(uid: string) {
    stopWatchActivities();

    const q = query(
      collection(getFirestore(), 'activities'),
      where('uid', '==', uid),
      orderBy('updated', 'desc')
    );
    console.log('==== onSnapshot uid:', uid);
    unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          activities.value.splice(change.newIndex, 0, {
            id: change.doc.id,
            data: change.doc.data() as ActivityDocumentData,
          });
        } else if (change.type == 'removed') {
          activities.value.splice(change.oldIndex, 1);
        } else {
          const data = {
            id: change.doc.id,
            data: change.doc.data() as ActivityDocumentData,
          };
          if (change.newIndex != change.oldIndex) {
            activities.value.splice(change.oldIndex, 1);
            activities.value.splice(change.newIndex, 0, data);
          } else {
            activities.value[change.newIndex] = data;
          }
        }
      });
    });
  }

  function stopWatchActivities() {
    if (unsubscribe) {
      unsubscribe();
      unsubscribe = null;
    }
    activities.value = [];
  }

  async function onRecordAdded(recordData: RecordDocumentData) {
    const aid = recordData.aid;
    if (!aid) return;

    const activityData = docData(aid);
    if (!activityData) return;

    let prevNumRecords = 0;
    if (activityData.cache && activityData.cache.numRecords)
      prevNumRecords = activityData.cache.numRecords;
    let prevElapsedTime = 0;
    if (activityData.cache && activityData.cache.elapsedTime)
      prevElapsedTime = activityData.cache.elapsedTime;

    await updateDoc(doc(getFirestore(), 'activities', aid), {
      'cache.numRecords': prevNumRecords + 1,
      'cache.elapsedTime': prevElapsedTime + recordData.duration,
      updated: Timestamp.now(),
    });
  }

  async function onRecordDeleted(recordData: RecordDocumentData) {
    const aid = recordData.aid;
    if (!aid) return;

    const activityData = docData(aid);
    if (!activityData) return;

    let prevNumRecords = 0;
    if (activityData.cache && activityData.cache.numRecords)
      prevNumRecords = activityData.cache.numRecords;
    let prevElapsedTime = 0;
    if (activityData.cache && activityData.cache.elapsedTime)
      prevElapsedTime = activityData.cache.elapsedTime;

    await updateDoc(doc(getFirestore(), 'activities', aid), {
      'cache.numRecords': prevNumRecords - 1,
      'cache.elapsedTime': prevElapsedTime - recordData.duration,
      updated: Timestamp.now(),
    });
  }

  async function onRecordUpdated(
    prev: RecordDocumentData,
    next: RecordDocumentData
  ) {
    const aid = next.aid;
    if (!aid) return;

    const activityData = docData(aid);
    if (!activityData) return;

    let prevElapsedTime = 0;
    if (activityData.cache && activityData.cache.elapsedTime)
      prevElapsedTime = activityData.cache.elapsedTime;

    await updateDoc(doc(getFirestore(), 'activities', aid), {
      'cache.elapsedTime': prevElapsedTime + (next.duration - prev.duration),
      updated: Timestamp.now(),
    });
  }

  function docData(id: string) {
    return idToActivity.value[id];
  }

  async function addActivity(
    label: string,
    cid: string,
    aid?: string,
    inBatch?: WriteBatch
  ) {
    const data: ActivityDocumentData = {
      uid: uid.value,
      label: label,
      cid: cid,
      updated: Timestamp.now(),
    };
    const batch = inBatch || writeBatch(getFirestore());
    const colRef = collection(getFirestore(), 'activities');
    const docRef = aid ? doc(colRef, aid) : doc(colRef);
    cacheStore.onActivityAdded(batch, docRef.id, data);
    batch.set(docRef, data);
    if (!inBatch) await batch.commit();
  }

  async function deleteActivity(id: string) {
    const colRef = collection(getFirestore(), 'activities');
    const docRef = doc(colRef, id) as DocumentReference<ActivityDocumentData>;
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) {
      console.error('Trying to delete an activity which does not exist.');
      return;
    }
    const oldData = snapshot.data();
    const batch = writeBatch(getFirestore());
    cacheStore.onActivityDeleted(batch, id, oldData);
    batch.delete(docRef);
    await batch.commit();
  }

  async function updateActivity(id: string, change: ActivityChange) {
    const colRef = collection(getFirestore(), 'activities');
    const docRef = doc(colRef, id) as DocumentReference<ActivityDocumentData>;
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) {
      console.error('Trying to update an activity which does not exist.');
      return;
    }
    const oldData = snapshot.data();
    const newData = { ...oldData, ...change };
    const batch = writeBatch(getFirestore());
    cacheStore.onActivityUpdated(batch, id, oldData, newData);
    batch.set(docRef, newData);
    await batch.commit();
  }

  async function exportActivities() {
    const q = query(
      collection(getFirestore(), 'activities'),
      where('uid', '==', uid.value),
      orderBy('updated', 'desc')
    );
    const snapshot = (await getDocs(q)) as QuerySnapshot<ActivityDocumentData>;

    const res = [] as PortableActivity[];
    for (let i = snapshot.docs.length - 1; i >= 0; i--) {
      const doc = snapshot.docs[i];
      res.push({
        id: doc.id,
        categoryId: doc.data().cid,
        label: doc.data().label,
      });
    }
    return res;
  }

  async function importActivities(acts: PortableActivity[]) {
    const batch = writeBatch(getFirestore());
    for (const act of acts) {
      await addActivity(act.label, act.categoryId, act.id, batch);
    }
    await batch.commit();
  }

  console.log('Setup activityStore end');
  return {
    docData,
    addActivity,
    deleteActivity,
    updateActivity,
    onRecordAdded,
    onRecordDeleted,
    onRecordUpdated,
    exportActivities,
    importActivities,
  };
});
