import { ref, watch } from 'vue';
import { defineStore, storeToRefs } from 'pinia';
import {
  getFirestore,
  onSnapshot,
  collection,
  query,
  where,
} from 'firebase/firestore';
import { useUserDataStore } from './user-data-store';
import { ActivityDocumentData } from 'src/components/models';

export interface ActivityData {
  id: string;
  data: ActivityDocumentData;
}

export const useActivityStore = defineStore('activities', () => {
  const userStore = useUserDataStore();
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
          console.log(
            'added called. ID is ',
            change.doc.id,
            ' and data is ',
            change.doc.data()
          );
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

  return { activities, getActivityData };
});
