import { defineStore, storeToRefs } from 'pinia';
import {
  defaultActivityName,
  defaultCategoryColor,
  defaultCategoryName,
} from 'src/common/constants';
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

  const { ongoing } = storeToRefs(userStore);
  const { idToCategory } = storeToRefs(categoryStore);
  const { idToActivity } = storeToRefs(activityStore);

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

  async function updateMemo(memo: string) {
    userStore.updateOngoingMemo(memo);
  }

  async function updateStart(start: Date) {
    userStore.updateOngoingStartTime(start);
  }

  async function finish() {
    recordStore.finishRecording();
  }

  return {
    ongoing,
    recording,
    activity,
    category,
    activityName,
    categoryName,
    categoryColor,
    updateMemo,
    updateStart,
    finish,
  };
});
