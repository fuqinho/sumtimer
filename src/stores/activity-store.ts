import { defineStore, storeToRefs } from 'pinia';
import {
  getFirestore,
  collection,
  query,
  where,
  doc,
  orderBy,
  Timestamp,
  writeBatch,
  getDocs,
  QuerySnapshot,
  DocumentReference,
  getDoc,
  WriteBatch,
} from 'firebase/firestore';
import { ActivityDocumentData, ActivityChange } from 'src/types/documents';
import { PortableActivity } from 'src/types/portable';
import { useAuthStore } from 'src/stores/auth-store';
import { useCacheStore } from 'src/stores/cache-store';

export const useActivityStore = defineStore('activities', () => {
  console.log('Setup activityStore start');
  const authStore = useAuthStore();
  const cacheStore = useCacheStore();
  const { uid } = storeToRefs(authStore);

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
    const batch = writeBatch(getFirestore());
    cacheStore.onActivityDeleted(batch, id);
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
    addActivity,
    deleteActivity,
    updateActivity,
    exportActivities,
    importActivities,
  };
});
