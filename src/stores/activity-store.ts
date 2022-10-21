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
  orderBy,
  serverTimestamp,
  addDoc,
  Timestamp,
} from 'firebase/firestore';
import {
  ActivityDocumentData,
  ActivityDoc,
  RecordDocumentData,
} from 'src/common/types';
import { useUtil } from 'src/composables/util';
import { useUserDataStore } from 'src/stores/user-data-store';

export const useActivityStore = defineStore('activities', () => {
  const userStore = useUserDataStore();
  const util = useUtil();
  const { uid } = storeToRefs(userStore);
  const activities = ref([] as ActivityDoc[]);

  startWatchActivities(uid.value);
  watch(uid, startWatchActivities);

  function startWatchActivities(uid: string) {
    if (!uid) return;

    const activitiesCollection = collection(getFirestore(), 'activities');
    const q = query(
      activitiesCollection,
      where('uid', '==', userStore.uid),
      orderBy('updated', 'desc')
    );
    onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          activities.value.splice(change.newIndex, 0, {
            id: change.doc.id,
            data: change.doc.data() as ActivityDocumentData,
          });
        } else if (change.type == 'removed') {
          activities.value.splice(change.oldIndex, 1);
        } else {
          const data = {
            id: change.doc.id,
            data: change.doc.data() as ActivityDocumentData,
          };
          if (change.newIndex != change.oldIndex) {
            activities.value.splice(change.oldIndex, 1);
            activities.value.splice(change.newIndex, 0, data);
          } else {
            activities.value[change.newIndex] = data;
          }
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
      updated: serverTimestamp(),
    });
  }

  async function addActivity(label: string, cid?: string) {
    const data: ActivityDocumentData = {
      uid: uid.value,
      label: label,
      updated: Timestamp.now(),
    };
    if (cid) {
      data.cid = cid;
    }
    await addDoc(collection(getFirestore(), 'activities'), data);
  }

  async function updateActivity(id: string, change: object) {
    await updateDoc(doc(getFirestore(), 'activities', id), change);
  }

  return {
    activities,
    getActivityData,
    addActivity,
    updateActivity,
    onRecordAdded,
  };
});
