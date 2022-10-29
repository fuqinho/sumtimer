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
  serverTimestamp,
  addDoc,
  Timestamp,
  deleteDoc,
  writeBatch,
  getDocs,
  QuerySnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import {
  ActivityDocumentData,
  ActivityDoc,
  RecordDocumentData,
} from 'src/types/documents';
import { PortableActivity } from 'src/types/portable';
import { useAuthStore } from 'src/stores/auth-store';

export const useActivityStore = defineStore('activities', () => {
  console.log('Setup activityStore start');
  const authStore = useAuthStore();
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
      updated: serverTimestamp(),
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
      updated: serverTimestamp(),
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
      updated: serverTimestamp(),
    });
  }

  function docData(id: string) {
    return idToActivity.value[id];
  }

  async function addActivity(label: string, cid?: string) {
    const data: ActivityDocumentData = {
      uid: uid.value,
      label: label,
      updated: Timestamp.now(),
    };
    if (cid) {
      data.cid = cid;
    }
    await addDoc(collection(getFirestore(), 'activities'), data);
  }

  async function deleteActivity(id: string) {
    await deleteDoc(doc(getFirestore(), 'activities', id));
  }

  async function deleteActivities(ids: string[]) {
    const batch = writeBatch(getFirestore());
    for (const id of ids) {
      batch.delete(doc(getFirestore(), 'activities', id));
    }
    await batch.commit();
  }

  async function updateActivity(id: string, change: object) {
    await updateDoc(doc(getFirestore(), 'activities', id), change);
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
      const data: ActivityDocumentData = {
        uid: uid.value,
        label: act.label,
        updated: Timestamp.now(),
      };
      if (act.categoryId) data.cid = act.categoryId;
      batch.set(doc(getFirestore(), 'activities', act.id), data);
    }
    await batch.commit();
  }

  console.log('Setup activityStore end');
  return {
    activities,
    idToActivity,
    docData,
    addActivity,
    deleteActivity,
    deleteActivities,
    updateActivity,
    onRecordAdded,
    onRecordDeleted,
    onRecordUpdated,
    exportActivities,
    importActivities,
  };
});
