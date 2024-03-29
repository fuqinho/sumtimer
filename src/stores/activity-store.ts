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
import type {
  ActivityDocumentData,
  ActivityChange,
  ActivityDoc,
} from '@/types/documents';
import type { PortableActivity } from '@/types/portable';
import { useAuthStore } from '@/stores/auth-store';
import { useCacheStore } from '@/stores/cache-store';
import { useRecordStore } from './record-store';

export const enum DeleteActivityResult {
  Success,
  ErrorHasRecords,
}

export const useActivityStore = defineStore('activities', () => {
  console.log('Setup activityStore start');
  const authStore = useAuthStore();
  const cacheStore = useCacheStore();
  const recordStore = useRecordStore();
  const { uid } = storeToRefs(authStore);

  async function addActivity(
    label: string,
    cid: string,
    aid?: string,
    updatedAt?: Date,
    inBatch?: WriteBatch
  ) {
    const data: ActivityDocumentData = {
      uid: uid.value,
      label: label,
      cid: cid,
      updated: updatedAt ? Timestamp.fromDate(updatedAt) : Timestamp.now(),
    };
    const batch = inBatch || writeBatch(getFirestore());
    const colRef = collection(getFirestore(), 'activities');
    const docRef = aid ? doc(colRef, aid) : doc(colRef);
    cacheStore.onActivityAdded(batch, docRef.id, data);
    batch.set(docRef, data);
    if (!inBatch) await batch.commit();
  }

  async function deleteActivity(id: string): Promise<DeleteActivityResult> {
    // Check if the specified activity has records.
    const recordsCount = await recordStore.countRecords(id);
    if (recordsCount > 0) {
      return DeleteActivityResult.ErrorHasRecords;
    }
    const colRef = collection(getFirestore(), 'activities');
    const docRef = doc(colRef, id) as DocumentReference<ActivityDocumentData>;
    const batch = writeBatch(getFirestore());
    cacheStore.onActivityDeleted(batch, id);
    batch.delete(docRef);
    await batch.commit();
    return DeleteActivityResult.Success;
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

  async function getActivitiesByCategory(cid: string): Promise<ActivityDoc[]> {
    const q = query(
      collection(getFirestore(), 'activities'),
      where('uid', '==', uid.value),
      where('cid', '==', cid)
    );
    const snapshot = (await getDocs(q)) as QuerySnapshot<ActivityDocumentData>;
    return snapshot.docs.map((d) => {
      return { id: d.id, data: d.data() };
    });
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
        updatedAt: doc.data().updated.toDate(),
      });
    }
    return res;
  }

  async function importActivities(acts: PortableActivity[]) {
    const batch = writeBatch(getFirestore());
    for (const act of acts) {
      await addActivity(
        act.label,
        act.categoryId,
        act.id,
        act.updatedAt,
        batch
      );
    }
    await batch.commit();
  }

  console.log('Setup activityStore end');
  return {
    addActivity,
    deleteActivity,
    updateActivity,
    getActivitiesByCategory,
    exportActivities,
    importActivities,
  };
});
