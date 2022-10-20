import { ref, watch } from 'vue';
import { defineStore, storeToRefs } from 'pinia';
import {
  getFirestore,
  onSnapshot,
  collection,
  query,
  where,
  updateDoc,
  doc,
} from 'firebase/firestore';
import {
  ActivityDocumentData,
  ActivityData,
  RecordDocumentData,
} from 'src/common/types';
import { useUtil } from 'src/composables/util';
import { useUserDataStore } from 'src/stores/user-data-store';

export const useActivityStore = defineStore('activities', () => {
  const userStore = useUserDataStore();
  const util = useUtil();
  const { uid } = storeToRefs(userStore);
  const activities = ref([] as ActivityData[]);

  startWatchActivities(uid.value);
  watch(uid, startWatchActivities);

  function startWatchActivities(uid: string) {
    if (!uid) return;

    const activitiesCollection = collection(getFirestore(), 'activities');
    const q = query(activitiesCollection, where('uid', '==', userStore.uid));
    onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          activities.value.push({
            id: change.doc.id,
            data: change.doc.data() as ActivityDocumentData,
          });
        } else if (change.type == 'removed') {
          activities.value.forEach((item, index) => {
            if (item.id === change.doc.id) {
              activities.value.splice(index, 1);
            }
          });
        } else {
          activities.value.forEach((item, index) => {
            if (item.id === change.doc.id) {
              activities.value[index].data =
                change.doc.data() as ActivityDocumentData;
            }
          });
        }
      });
    });
  }

  function getActivityData(aid: string): ActivityDocumentData | null {
    for (const activity of activities.value) {
      if (activity.id === aid) {
        return activity.data;
      }
    }
    return null;
  }

  async function onRecordAdded(recordData: RecordDocumentData) {
    const aid = recordData.aid;
    if (!aid) return;

    const activityData = getActivityData(aid);
    if (!activityData) return;

    let prevNumRecords = 0;
    if (activityData.cache && activityData.cache.numRecords)
      prevNumRecords = activityData.cache.numRecords;
    let prevElapsedTime = 0;
    if (activityData.cache && activityData.cache.elapsedTime)
      prevElapsedTime = activityData.cache.elapsedTime;

    await updateDoc(doc(getFirestore(), 'activities', aid), {
      'cache.numRecords': prevNumRecords + 1,
      'cache.elapsedTime': prevElapsedTime + util.computeDuration(recordData),
    });
  }

  return { activities, getActivityData, onRecordAdded };
});
