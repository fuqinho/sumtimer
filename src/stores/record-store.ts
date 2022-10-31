import { ref, watch } from 'vue';
import { defineStore, storeToRefs } from 'pinia';
import { date } from 'quasar';
import {
  collection,
  doc,
  DocumentReference,
  getDoc,
  getDocs,
  getFirestore,
  limitToLast,
  onSnapshot,
  orderBy,
  query,
  QuerySnapshot,
  Timestamp,
  Unsubscribe,
  where,
  WriteBatch,
  writeBatch,
} from 'firebase/firestore';
import {
  RecordDocumentData,
  RecordDoc,
  RecordChange,
} from 'src/types/documents';
import { PortableRecord } from 'src/types/portable';
import { useAuthStore } from 'src/stores/auth-store';
import { useCacheStore } from 'src/stores/cache-store';
import { useActivityStore } from 'src/stores/activity-store';
import { useUtil } from 'src/composables/util';

export const useRecordStore = defineStore('records', () => {
  console.log('Setup recordStore start');
  const authStore = useAuthStore();
  const activityStore = useActivityStore();
  const cacheStore = useCacheStore();
  const { startOfWeek } = useUtil();

  const { uid } = storeToRefs(authStore);
  const recentRecords = ref([] as RecordDoc[]);
  const requestedRecords = ref([] as RecordDoc[]);

  let unsubRecent = null as Unsubscribe | null;
  let unsubRequested = null as Unsubscribe | null;
  onUpdateUid();
  watch(uid, onUpdateUid);

  function onUpdateUid() {
    console.log('recordStore::onUpdateUid():', uid.value);
    if (uid.value) {
      startWatchRecentRecords(uid.value);
    } else {
      stopWatchRecentRecords();
    }
  }

  function startWatchRecentRecords(uid: string) {
    stopWatchRecentRecords();

    const start = startOfWeek(new Date());
    const end = date.addToDate(start, { days: 8 });

    const q = query(
      collection(getFirestore(), 'records'),
      where('uid', '==', uid),
      where('end', '>', start),
      where('end', '<', end),
      orderBy('end', 'desc'),
      limitToLast(300)
    );
    unsubRecent = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          recentRecords.value.splice(change.newIndex, 0, {
            id: change.doc.id,
            data: change.doc.data() as RecordDocumentData,
          });
        } else if (change.type === 'removed') {
          recentRecords.value.splice(change.oldIndex, 1);
        } else {
          const newItem = {
            id: change.doc.id,
            data: change.doc.data() as RecordDocumentData,
          };
          if (change.newIndex != change.oldIndex) {
            recentRecords.value.splice(change.oldIndex, 1);
            recentRecords.value.splice(change.newIndex, 0, newItem);
          } else {
            recentRecords.value[change.newIndex] = newItem;
          }
        }
      });
    });
  }

  function stopWatchRecentRecords() {
    if (unsubRecent) {
      unsubRecent();
      unsubRecent = null;
    }
    recentRecords.value = [];
  }

  function startWatchRequestedRecords(uid: string, start: Date) {
    stopWatchRequestedRecords();

    const end = date.addToDate(start, { days: 8 });

    const q = query(
      collection(getFirestore(), 'records'),
      where('uid', '==', uid),
      where('end', '>', start),
      where('end', '<', end),
      orderBy('end', 'desc'),
      limitToLast(300)
    );
    unsubRequested = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          requestedRecords.value.splice(change.newIndex, 0, {
            id: change.doc.id,
            data: change.doc.data() as RecordDocumentData,
          });
        } else if (change.type === 'removed') {
          requestedRecords.value.splice(change.oldIndex, 1);
        } else {
          const newItem = {
            id: change.doc.id,
            data: change.doc.data() as RecordDocumentData,
          };
          if (change.newIndex != change.oldIndex) {
            requestedRecords.value.splice(change.oldIndex, 1);
            requestedRecords.value.splice(change.newIndex, 0, newItem);
          } else {
            requestedRecords.value[change.newIndex] = newItem;
          }
        }
      });
    });
  }

  function stopWatchRequestedRecords() {
    if (unsubRequested) {
      unsubRequested();
      unsubRequested = null;
    }
    requestedRecords.value = [];
  }

  async function addRecord(
    rec: PortableRecord,
    rid?: string,
    inBatch?: WriteBatch
  ) {
    const frameNum = rec.timeFrames.length;
    const start = rec.timeFrames[0].start;
    const end = rec.timeFrames[frameNum - 1].end;
    let duration = 0;
    for (const frame of rec.timeFrames) {
      duration += frame.end.getTime() - frame.start.getTime();
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

    const batch = inBatch || writeBatch(getFirestore());
    const colRef = collection(getFirestore(), 'records');
    const docRef = rid ? doc(colRef, rid) : doc(colRef);
    activityStore.updateActivity(data.aid, { updated: Timestamp.now() });
    cacheStore.onRecordAdded(batch, docRef.id, data);
    batch.set(docRef, data);
    if (!inBatch) await batch.commit();
  }

  async function deleteRecord(id: string) {
    const colRef = collection(getFirestore(), 'records');
    const docRef = doc(colRef, id) as DocumentReference<RecordDocumentData>;
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) {
      console.error('Trying to delete a record which does not exist.');
      return;
    }
    const oldData = snapshot.data();
    const batch = writeBatch(getFirestore());
    cacheStore.onRecordDeleted(batch, id, oldData);
    batch.delete(docRef);
    await batch.commit();
  }

  async function updateRecord(id: string, change: RecordChange) {
    const colRef = collection(getFirestore(), 'records');
    const docRef = doc(colRef, id) as DocumentReference<RecordDocumentData>;
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) {
      console.error('Trying to update a record which does not exist.');
      return;
    }
    const oldData = snapshot.data();
    const newData = { ...oldData, ...change };
    const batch = writeBatch(getFirestore());
    cacheStore.onRecordUpdated(batch, id, oldData, newData);
    batch.set(docRef, newData);
    await batch.commit();
  }

  async function deleteRecords(ids: string[]) {
    const batch = writeBatch(getFirestore());
    for (const id of ids) {
      batch.delete(doc(getFirestore(), 'records', id));
    }
    await batch.commit();
  }

  async function deleteRecordsByActivityId(aid: string) {
    const q = query(
      collection(getFirestore(), 'records'),
      where('uid', '==', uid.value),
      where('aid', '==', aid)
    );
    const snapshot = (await getDocs(q)) as QuerySnapshot<RecordDocumentData>;
    const batch = writeBatch(getFirestore());
    for (const doc of snapshot.docs) {
      batch.delete(doc.ref);
    }
    await batch.commit();
  }

  function requestRecords(startTime: Date) {
    if (uid.value) {
      const start = startOfWeek(startTime);
      startWatchRequestedRecords(uid.value, start);
    }
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
      addRecord(rec, rec.id, batch);
    }
    await batch.commit();
  }

  console.log('Setup recordStore end');
  return {
    recentRecords,
    requestedRecords,
    addRecord,
    updateRecord,
    deleteRecord,
    deleteRecords,
    deleteRecordsByActivityId,
    requestRecords,
    exportRecords,
    importRecords,
  };
});
