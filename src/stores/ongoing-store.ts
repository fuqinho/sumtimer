import { computed, ref, watch } from 'vue';
import { defineStore, storeToRefs } from 'pinia';
import { useWakeLock } from '@vueuse/core';
import {
  arrayUnion,
  deleteDoc,
  deleteField,
  doc,
  getFirestore,
  onSnapshot,
  setDoc,
  Timestamp,
  type Unsubscribe,
  updateDoc,
  collection,
} from 'firebase/firestore';
import type { OngoingDocumentData } from '@/types/documents';
import type { PortableRecord } from '@/types/portable';
import {
  defaultActivityName,
  defaultCategoryColor,
  defaultCategoryName,
  maxPauseDurationMs,
} from '@/common/constants';
import { useRecordStore } from '@/stores/record-store';
import { useAuthStore } from '@/stores/auth-store';
import { useCacheStore } from '@/stores/cache-store';
import { useTimeStore } from '@/stores/time-store';

export const useOngoingStore = defineStore('ongoing', () => {
  console.log('Setup ongoingStore start');
  const authStore = useAuthStore();
  const recordStore = useRecordStore();
  const cacheStore = useCacheStore();
  const timeStore = useTimeStore();
  const { request, release } = useWakeLock();

  const { uid } = storeToRefs(authStore);
  const { idToCategory, idToActivity } = storeToRefs(cacheStore);
  const { nowMillis } = storeToRefs(timeStore);

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
  const elapsedMillis = computed(() => {
    if (!ongoing.value) return 0;
    let ms = 0;
    if (ongoing.value.subs) {
      for (const sub of ongoing.value.subs) {
        ms += sub.end.toMillis() - sub.start.toMillis();
      }
    }
    if (ongoing.value.curStart) {
      ms += nowMillis.value - ongoing.value.curStart.toMillis();
    }
    return Math.max(ms, 0);
  });
  const pausedMillis = computed(() => {
    if (!ongoing.value || ongoing.value.curStart) return 0;
    if (!ongoing.value.subs) return 0;
    const lastMs =
      ongoing.value.subs[ongoing.value.subs.length - 1].end.toMillis();
    const diff = nowMillis.value - lastMs;
    return Math.max(0, diff);
  });

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

    const newRecordId = doc(collection(getFirestore(), 'records')).id;
    const docData = {
      aid: aid,
      cid: idToActivity.value[aid].cid,
      recStart: Timestamp.now(),
      curStart: Timestamp.now(),
      rid: newRecordId,
    };
    await setDoc(docRef.value, docData);
    await request('screen');
  }

  async function finish() {
    await release();

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
    await recordStore.addRecord(data, ongoing.value.rid);
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

  async function reset() {
    await release();
    if (!ongoing.value) return;
    await deleteDoc(docRef.value);
  }

  watch(nowMillis, async () => {
    if (ongoing.value && pausedMillis.value > maxPauseDurationMs) {
      await finish();
    }
  });

  console.log('Setup ongoingStore end');

  return {
    ongoing,
    recording,
    activity,
    category,
    activityName,
    categoryName,
    categoryColor,
    elapsedMillis,
    pausedMillis,
    totalDuration,
    updateMemo,
    updateCurStart,
    updateSubStart,
    updateSubEnd,
    start,
    finish,
    pause,
    resume,
    reset,
  };
});
