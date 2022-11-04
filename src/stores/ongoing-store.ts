import {
  arrayUnion,
  deleteDoc,
  deleteField,
  doc,
  getFirestore,
  onSnapshot,
  setDoc,
  Timestamp,
  Unsubscribe,
  updateDoc,
} from 'firebase/firestore';
import { defineStore, storeToRefs } from 'pinia';
import {
  defaultActivityName,
  defaultCategoryColor,
  defaultCategoryName,
} from 'src/common/constants';
import { OngoingDocumentData } from 'src/types/documents';
import { useRecordStore } from 'src/stores/record-store';
import { useAuthStore } from 'src/stores/auth-store';
import { computed, ref, watch } from 'vue';
import { useCacheStore } from './cache-store';
import { PortableRecord } from 'src/types/portable';

export const useOngoingStore = defineStore('ongoing', () => {
  console.log('Setup ongoingStore start');
  const authStore = useAuthStore();
  const recordStore = useRecordStore();
  const cacheStore = useCacheStore();

  const { uid } = storeToRefs(authStore);
  const { idToCategory, idToActivity } = storeToRefs(cacheStore);

  const ongoing = ref(null as OngoingDocumentData | null);

  let unsubscribe = null as Unsubscribe | null;
  onUpdateUid();
  watch(uid, onUpdateUid);

  function onUpdateUid() {
    console.log('ongoingStore::onUpdateUid():', uid.value);
    if (uid.value) {
      startWatchOngoing(uid.value);
    } else {
      stopWatchOngoing();
    }
  }

  function startWatchOngoing(uid: string) {
    stopWatchOngoing();
    unsubscribe = onSnapshot(
      doc(getFirestore(), 'ongoings', uid),
      (snapshot) => {
        if (snapshot.exists()) {
          ongoing.value = snapshot.data() as OngoingDocumentData;
        } else {
          ongoing.value = null;
        }
      }
    );
  }
  function stopWatchOngoing() {
    if (unsubscribe) {
      unsubscribe();
      unsubscribe = null;
    }
    ongoing.value = null;
  }

  const docRef = computed(() => doc(getFirestore(), 'ongoings', uid.value));
  const recording = computed(() => !!ongoing.value);
  const activity = computed(() =>
    ongoing.value ? idToActivity.value[ongoing.value.aid] : null
  );
  const category = computed(() => {
    if (activity.value) {
      const cid = activity.value.cid;
      return cid ? idToCategory.value[cid] : null;
    }
    return null;
  });
  const activityName = computed(() =>
    activity.value ? activity.value.label : defaultActivityName
  );
  const categoryName = computed(() =>
    category.value ? category.value.label : defaultCategoryName
  );
  const categoryColor = computed(() =>
    category.value ? category.value.color : defaultCategoryColor
  );

  function totalDuration() {
    if (!ongoing.value) return 0;

    let res = 0;
    if (ongoing.value.subs) {
      for (const sub of ongoing.value.subs) {
        res += sub.end.toMillis() - sub.start.toMillis();
      }
    }
    if (ongoing.value.curStart) {
      res += Date.now() - ongoing.value.curStart.toMillis();
    }
    return res;
  }

  function recEndMillis() {
    if (!ongoing.value) return Date.now();

    let res = 0;
    if (ongoing.value.curStart) res = Date.now();
    if (ongoing.value.subs) {
      for (const sub of ongoing.value.subs) {
        res = Math.max(res, sub.end.toMillis());
      }
    }
    return res;
  }

  async function updateMemo(memo: string) {
    await updateDoc(docRef.value, { memo: memo });
  }

  async function updateCurStart(start: Date) {
    if (!ongoing.value) return;

    let earliestStart = start.getTime();
    if (ongoing.value.subs) {
      for (const sub of ongoing.value.subs) {
        earliestStart = Math.min(earliestStart, sub.start.toMillis());
      }
    }
    await updateDoc(docRef.value, {
      recStart: Timestamp.fromMillis(earliestStart),
      curStart: Timestamp.fromDate(start),
    });
  }

  async function updateSubStart(index: number, time: Date) {
    if (!ongoing.value || !ongoing.value.subs) return;

    const newSubs = [];
    for (let i = 0; i < ongoing.value.subs.length; i++) {
      if (i == index) {
        newSubs.push({ start: time, end: ongoing.value.subs[i].end });
      } else {
        newSubs.push(ongoing.value.subs[i]);
      }
    }
    await updateDoc(docRef.value, { subs: newSubs });
  }

  async function updateSubEnd(index: number, time: Date) {
    if (!ongoing.value || !ongoing.value.subs) return;

    const newSubs = [];
    for (let i = 0; i < ongoing.value.subs.length; i++) {
      if (i == index) {
        newSubs.push({ start: ongoing.value.subs[i].start, end: time });
      } else {
        newSubs.push(ongoing.value.subs[i]);
      }
    }
    await updateDoc(docRef.value, { subs: newSubs });
  }

  async function start(aid: string) {
    if (ongoing.value) {
      if (ongoing.value.aid == aid) return;
      // If the user is trying to start a different activity,
      // the ongoing activity should be finished.
      await finish();
    }

    const docData = {
      aid: aid,
      recStart: Timestamp.now(),
      curStart: Timestamp.now(),
    };
    await setDoc(docRef.value, docData);
  }

  async function finish() {
    if (!ongoing.value) return;

    const timeFrames = [];
    if (ongoing.value.subs) {
      for (const sub of ongoing.value.subs) {
        timeFrames.push({
          start: sub.start.toDate(),
          end: sub.end.toDate(),
        });
      }
      if (ongoing.value.curStart) {
        timeFrames.push({
          start: ongoing.value.curStart.toDate(),
          end: Timestamp.now().toDate(),
        });
      }
    } else {
      timeFrames.push({
        start: ongoing.value.recStart.toDate(),
        end: Timestamp.fromMillis(recEndMillis()).toDate(),
      });
    }
    const data: PortableRecord = {
      id: '',
      activityId: ongoing.value.aid,
      timeFrames: timeFrames,
    };
    if (ongoing.value.memo) {
      data.memo = ongoing.value.memo;
    }
    await recordStore.addRecord(data);
    await deleteDoc(docRef.value);
  }

  async function pause() {
    if (!ongoing.value) return;

    await updateDoc(docRef.value, {
      subs: arrayUnion({
        start: ongoing.value.curStart,
        end: Timestamp.now(),
      }),
      curStart: deleteField(),
    });
  }

  async function resume() {
    if (!ongoing.value) return;

    await updateDoc(docRef.value, { curStart: Timestamp.now() });
  }

  console.log('Setup ongoingStore start');
  return {
    ongoing,
    recording,
    activity,
    category,
    activityName,
    categoryName,
    categoryColor,
    totalDuration,
    updateMemo,
    updateCurStart,
    updateSubStart,
    updateSubEnd,
    start,
    finish,
    pause,
    resume,
  };
});
