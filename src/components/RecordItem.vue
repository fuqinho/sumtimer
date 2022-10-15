<script setup lang="ts">
import { computed } from 'vue';
import { RecordDocumentData } from './models';

import { useActivityStore } from 'stores/activity-store';

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
</script>

<template>
  <p>{{ props.record_id }}</p>
  <p>{{ props.record_data.aid }}</p>
  <p>{{ activityName }}</p>
</template>
