import {
  arrayUnion,
  deleteField,
  doc,
  getFirestore,
  Timestamp,
  updateDoc,
} from 'firebase/firestore';
import { defineStore, storeToRefs } from 'pinia';
import {
  defaultActivityName,
  defaultCategoryColor,
  defaultCategoryName,
} from 'src/common/constants';
import { RecordDocumentData } from 'src/common/types';
import { useRecordStore } from 'src/stores/record-store';
import { useUserDataStore } from 'src/stores/user-data-store';
import { computed } from 'vue';
import { useActivityStore } from './activity-store';
import { useCategoryStore } from './category-store';

export const useOngoingStore = defineStore('ongoing', () => {
  const userStore = useUserDataStore();
  const categoryStore = useCategoryStore();
  const activityStore = useActivityStore();
  const recordStore = useRecordStore();

  const { uid, ongoing } = storeToRefs(userStore);
  const { idToCategory } = storeToRefs(categoryStore);
  const { idToActivity } = storeToRefs(activityStore);

  const userDocRef = computed(() => doc(getFirestore(), 'users', uid.value));
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
    await updateDoc(userDocRef.value, { 'ongoing.memo': memo });
  }

  async function updateCurStart(start: Date) {
    if (!ongoing.value) return;

    let earliestStart = start.getTime();
    if (ongoing.value.subs) {
      for (const sub of ongoing.value.subs) {
        console.log('lhs', earliestStart, 'rhs', sub.start.toMillis());
        earliestStart = Math.min(earliestStart, sub.start.toMillis());
      }
    }
    await updateDoc(userDocRef.value, {
      'ongoing.recStart': Timestamp.fromMillis(earliestStart),
      'ongoing.curStart': Timestamp.fromDate(start),
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
    await updateDoc(userDocRef.value, {
      'ongoing.subs': newSubs,
    });
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
    await updateDoc(userDocRef.value, {
      'ongoing.subs': newSubs,
    });
  }

  async function start(aid: string) {
    if (ongoing.value) return;

    const docData = {
      aid: aid,
      recStart: Timestamp.now(),
      curStart: Timestamp.now(),
    };
    await updateDoc(userDocRef.value, { ongoing: docData });
  }

  async function finish() {
    if (!ongoing.value) return;

    const docData: RecordDocumentData = {
      uid: uid.value,
      aid: ongoing.value.aid,
      start: ongoing.value.recStart,
      end: Timestamp.fromMillis(recEndMillis()),
      duration: totalDuration(),
    };
    if (ongoing.value.memo) {
      docData.memo = ongoing.value.memo;
    }
    if (ongoing.value.subs) {
      docData.subs = ongoing.value.subs;
    }
    await recordStore.addRecord(docData);
    await updateDoc(userDocRef.value, { ongoing: deleteField() });
  }

  async function pause() {
    if (!ongoing.value) return;

    await updateDoc(userDocRef.value, {
      'ongoing.subs': arrayUnion({
        start: ongoing.value.curStart,
        end: Timestamp.now(),
      }),
      'ongoing.curStart': deleteField(),
    });
  }

  async function resume() {
    if (!ongoing.value) return;

    await updateDoc(userDocRef.value, { 'ongoing.curStart': Timestamp.now() });
  }

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
