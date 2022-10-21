import { ref, watch } from 'vue';
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
  Timestamp,
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
  const { uid, ongoing } = storeToRefs(userStore);

  const records = ref([] as RecordDoc[]);

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

  async function addRecord(
    aid: string,
    start: Timestamp,
    end: Timestamp,
    memo?: string
  ) {
    const docData: RecordDocumentData = {
      uid: uid.value,
      aid: aid,
      start: start,
      end: end,
    };
    if (memo) docData.memo = memo;
    await addDoc(collection(getFirestore(), 'records'), docData);
    activityStore.onRecordAdded(docData);
  }

  async function updateRecord(id: string, change: object) {
    await updateDoc(doc(getFirestore(), 'records', id), change);
  }

  async function deleteRecord(id: string) {
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

  async function startRecording(aid: string) {
    await userStore.startOngoingActivity(aid);
  }

  async function finishRecording() {
    if (!ongoing.value) return;

    await addRecord(
      ongoing.value.aid,
      ongoing.value.start,
      Timestamp.now(),
      ongoing.value.memo
    );
    await userStore.finishOngoingActivity();
  }

  return {
    records,
    addRecord,
    updateRecord,
    deleteRecord,
    deleteRecords,
    deleteRecordsByActivityId,
    startRecording,
    finishRecording,
  };
});
