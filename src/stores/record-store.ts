import { computed, ref, watch } from 'vue';
import { defineStore, storeToRefs } from 'pinia';
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  getFirestore,
  limitToLast,
  onSnapshot,
  orderBy,
  query,
  QuerySnapshot,
  setDoc,
  Timestamp,
  Unsubscribe,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { RecordDocumentData, RecordDoc } from 'src/types/documents';
import { PortableRecord } from 'src/types/portable';
import { useAuthStore } from 'src/stores/auth-store';
import { useActivityStore } from 'src/stores/activity-store';
import { useCacheStore } from './cache-store';

export const useRecordStore = defineStore('records', () => {
  console.log('Setup recordStore start');
  const authStore = useAuthStore();
  const activityStore = useActivityStore();
  const cacheStore = useCacheStore();

  const { uid } = storeToRefs(authStore);
  const records = ref([] as RecordDoc[]);

  const idToRecord = computed(() => {
    return records.value.reduce((res, item) => {
      res[item.id] = item.data;
      return res;
    }, {} as { [key: string]: RecordDocumentData });
  });

  let unsubscribe = null as Unsubscribe | null;
  onUpdateUid();
  watch(uid, onUpdateUid);

  function onUpdateUid() {
    console.log('recordStore::onUpdateUid():', uid.value);
    if (uid.value) {
      startWatchRecords(uid.value);
    } else {
      stopWatchRecords();
    }
  }

  function startWatchRecords(uid: string) {
    stopWatchRecords();

    const q = query(
      collection(getFirestore(), 'records'),
      where('uid', '==', uid),
      orderBy('end', 'desc'),
      limitToLast(300)
    );
    unsubscribe = onSnapshot(q, (snapshot) => {
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

  function stopWatchRecords() {
    if (unsubscribe) {
      unsubscribe();
      unsubscribe = null;
    }
    records.value = [];
  }

  async function addRecord(docData: RecordDocumentData) {
    const docRef = doc(collection(getFirestore(), 'records'));
    await cacheStore.onRecordAdded(docRef.id, docData);
    await activityStore.onRecordAdded(docData);
    await setDoc(docRef, docData);
  }

  async function updateRecord(id: string, change: object) {
    const docPrev = idToRecord.value[id];
    if (docPrev) {
      const docNext = {
        ...docPrev,
        ...change,
      };
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

  async function exportRecords() {
    const q = query(
      collection(getFirestore(), 'records'),
      where('uid', '==', uid.value),
      orderBy('end', 'desc')
    );
    const snapshot = (await getDocs(q)) as QuerySnapshot<RecordDocumentData>;

    const res = [] as PortableRecord[];
    for (let i = snapshot.docs.length - 1; i >= 0; i--) {
      const doc = snapshot.docs[i];
      const data = {
        id: doc.id,
        activityId: doc.data().aid,
        timeFrames: [] as { start: Date; end: Date }[],
      } as PortableRecord;
      if (doc.data().memo) data.memo = doc.data().memo;
      const subs = doc.data().subs;
      if (subs) {
        for (const sub of subs) {
          data.timeFrames.push({
            start: sub.start.toDate(),
            end: sub.end.toDate(),
          });
        }
      } else {
        data.timeFrames.push({
          start: doc.data().start.toDate(),
          end: doc.data().end.toDate(),
        });
      }
      res.push(data);
    }
    return res;
  }

  async function importRecords(recs: PortableRecord[]) {
    const batch = writeBatch(getFirestore());
    for (const rec of recs) {
      let start = rec.timeFrames[0].start;
      let end = rec.timeFrames[0].end;
      let duration = 0;
      for (let i = 0; i < rec.timeFrames.length; i++) {
        start =
          start < rec.timeFrames[i].start ? start : rec.timeFrames[i].start;
        end = end > rec.timeFrames[i].end ? end : rec.timeFrames[i].end;
        duration +=
          rec.timeFrames[i].end.getTime() - rec.timeFrames[i].start.getTime();
      }
      const data: RecordDocumentData = {
        uid: uid.value,
        aid: rec.activityId,
        start: Timestamp.fromDate(start),
        end: Timestamp.fromDate(end),
        duration: duration,
      };
      if (rec.memo) data.memo = rec.memo;
      if (rec.timeFrames.length > 1) {
        data.subs = rec.timeFrames.map((t) => {
          return {
            start: Timestamp.fromDate(t.start),
            end: Timestamp.fromDate(t.end),
          };
        });
      }
      await activityStore.onRecordAdded(data);
      batch.set(doc(getFirestore(), 'records', rec.id), data);
    }
    await batch.commit();
  }

  console.log('Setup recordStore end');
  return {
    records,
    addRecord,
    updateRecord,
    deleteRecord,
    deleteRecords,
    deleteRecordsByActivityId,
    exportRecords,
    importRecords,
  };
});
