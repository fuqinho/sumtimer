import {
  addDoc,
  collection,
  getFirestore,
  limit,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
  where,
} from 'firebase/firestore';
import { defineStore, storeToRefs } from 'pinia';
import { RecordDocumentData } from 'src/components/models';
import { ref, watch } from 'vue';
import { useUserDataStore } from './user-data-store';

interface RecordData {
  id: string;
  data: RecordDocumentData;
}

export const useRecordStore = defineStore('records', () => {
  const userStore = useUserDataStore();
  const { uid, ongoing } = storeToRefs(userStore);

  const records = ref([] as RecordData[]);

  if (uid.value) startWatchRecords(uid.value);
  watch(uid, startWatchRecords);

  function startWatchRecords(uid: string) {
    if (!uid) return;
    const recordsCollection = collection(getFirestore(), 'records');
    const q = query(
      recordsCollection,
      where('uid', '==', uid),
      orderBy('start', 'desc'),
      limit(50)
    );
    onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          records.value.push({
            id: change.doc.id,
            data: change.doc.data() as RecordDocumentData,
          });
        } else if (change.type === 'removed') {
          records.value.forEach((item, index) => {
            if (item.id === change.doc.id) {
              records.value.splice(index, 1);
            }
          });
        } else {
          records.value.forEach((item, index) => {
            records.value[index] = item;
          });
        }
      });
    });
  }

  async function addRecord(aid: string, start: Timestamp, end: Timestamp) {
    const docData: RecordDocumentData = {
      uid: uid.value,
      aid: aid,
      start: start,
      end: end,
    };
    await addDoc(collection(getFirestore(), 'records'), docData);
  }

  async function startRecording(aid: string) {
    await userStore.startOngoingActivity(aid);
  }

  async function finishRecording() {
    if (!ongoing.value) return;

    await addRecord(ongoing.value.aid, ongoing.value.start, Timestamp.now());
    await userStore.finishOngoingActivity();
  }

  return { records, addRecord, startRecording, finishRecording };
});
