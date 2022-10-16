<script setup lang="ts">
import { computed } from 'vue';
import { RecordDocumentData } from './models';

import { useActivityStore } from 'stores/activity-store';
import { useUserDataStore } from 'src/stores/user-data-store';

const userStore = useUserDataStore();
const activityStore = useActivityStore();

const activityName = computed(() => {
  console.log(props.record_data);
  if (props.record_data.aid) {
    const doc = activityStore.getActivityData(props.record_data.aid);
    if (doc) console.log('returning', doc.label);
    return doc ? doc.label : '';
  }
  return '';
});

interface Props {
  record_id: string;
  record_data: RecordDocumentData;
}

const props = defineProps<Props>();

const categoryColor = computed(() => {
  const aid = props.record_data.aid;
  if (aid) {
    const activity = activityStore.getActivityData(aid);
    if (activity && activity.cid) {
      const category = userStore.getCategoryData(activity.cid);
      if (category) {
        return category.color;
      }
    }
  }
  return '#234365';
});

const categoryName = computed(() => {
  const aid = props.record_data.aid;
  if (aid) {
    const activity = activityStore.getActivityData(aid);
    if (activity && activity.cid) {
      const category = userStore.getCategoryData(activity.cid);
      if (category) {
        return category.label;
      }
    }
  }
  return 'Unknown category';
});
</script>

<template>
  <q-item>
    <q-item-section>
      <q-item-label
        ><q-badge
          :style="{
            'background-color': categoryColor,
          }"
          >{{ categoryName }}</q-badge
        ></q-item-label
      >
      <q-item-label>{{ activityName }}</q-item-label>
    </q-item-section>
    <q-item-section>
      <q-item-label caption>
        {{ props.record_data.start.toDate().toLocaleDateString() }}
      </q-item-label>
      <q-item-label caption>
        {{ props.record_data.start.toDate().toLocaleTimeString() }} -
        {{ props.record_data.end.toDate().toLocaleTimeString() }}
      </q-item-label>
    </q-item-section>
    <q-item-section side>
      <q-btn round color="gray" flat icon="edit" />
    </q-item-section>
    <q-item-section side>
      <q-btn round color="gray" flat icon="delete" />
    </q-item-section>
  </q-item>
</template>
