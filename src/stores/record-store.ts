import { computed, ref, watch } from 'vue';
import { defineStore, storeToRefs } from 'pinia';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getFirestore,
  limit,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { RecordDocumentData, RecordDoc } from 'src/common/types';
import { useUserDataStore } from 'src/stores/user-data-store';
import { useActivityStore } from 'src/stores/activity-store';

export const useRecordStore = defineStore('records', () => {
  const userStore = useUserDataStore();
  const activityStore = useActivityStore();
  const { uid } = storeToRefs(userStore);

  const records = ref([] as RecordDoc[]);
  const idToRecord = computed(() => {
    return records.value.reduce((res, item) => {
      res[item.id] = item.data;
      return res;
    }, {} as { [key: string]: RecordDocumentData });
  });

  if (uid.value) startWatchRecords(uid.value);
  watch(uid, startWatchRecords);

  function startWatchRecords(uid: string) {
    if (!uid) return;
    const recordsCollection = collection(getFirestore(), 'records');
    const q = query(
      recordsCollection,
      where('uid', '==', uid),
      orderBy('end', 'desc'),
      limit(50)
    );
    onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          records.value.splice(change.newIndex, 0, {
            id: change.doc.id,
            data: change.doc.data() as RecordDocumentData,
          });
        } else if (change.type === 'removed') {
          records.value.splice(change.oldIndex, 1);
        } else {
          const newItem = {
            id: change.doc.id,
            data: change.doc.data() as RecordDocumentData,
          };
          if (change.newIndex != change.oldIndex) {
            records.value.splice(change.oldIndex, 1);
            records.value.splice(change.newIndex, 0, newItem);
          } else {
            records.value[change.newIndex] = newItem;
          }
        }
      });
    });
  }

  async function addRecord(docData: RecordDocumentData) {
    await activityStore.onRecordAdded(docData);
    await addDoc(collection(getFirestore(), 'records'), docData);
  }

  async function updateRecord(id: string, change: object) {
    const docPrev = idToRecord.value[id];
    if (docPrev) {
      const docNext = {
        ...docPrev,
        ...change,
      };
      console.log('docPrev', docPrev);
      console.log('docNext', docNext);
      await activityStore.onRecordUpdated(docPrev, docNext);
    }
    await updateDoc(doc(getFirestore(), 'records', id), change);
  }

  async function deleteRecord(id: string) {
    const docData = idToRecord.value[id];
    if (docData) await activityStore.onRecordDeleted(docData);
    await deleteDoc(doc(getFirestore(), 'records', id));
  }

  async function deleteRecords(ids: string[]) {
    const batch = writeBatch(getFirestore());
    for (const id of ids) {
      batch.delete(doc(getFirestore(), 'records', id));
    }
    await batch.commit();
  }

  async function deleteRecordsByActivityId(aid: string) {
    const ids = records.value
      .filter((o) => o.data.aid === aid)
      .map((o) => o.id);
    await deleteRecords(ids);
  }

  return {
    records,
    addRecord,
    updateRecord,
    deleteRecord,
    deleteRecords,
    deleteRecordsByActivityId,
  };
});
