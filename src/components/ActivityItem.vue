<script setup lang="ts">
import { computed } from 'vue';
import { Timestamp } from '@firebase/firestore';
import { ActivityDocumentData } from 'src/common/types';
import { useUserDataStore } from 'src/stores/user-data-store';
import { useRecordStore } from 'src/stores/record-store';

interface Props {
  activity_id: string;
  activity_data: ActivityDocumentData;
}

const props = defineProps<Props>();

const userStore = useUserDataStore();
const recordStore = useRecordStore();

const categoryName = computed(() => {
  if (!props.activity_data.cid) return 'Uncategorized';

  const data = userStore.getCategoryData(props.activity_data.cid);
  if (data && data.label) return data.label;
  return 'Uncategorized';
});

const categoryColor = computed(() => {
  if (!props.activity_data.cid) return '#bdbdbd';

  const data = userStore.getCategoryData(props.activity_data.cid);
  if (data && data.color) return data.color;
  return '#ff0000';
});

function addRecordForTesting() {
  const end = Timestamp.now();
  const start = Timestamp.fromMillis(end.toMillis() - 30 * 60 * 1000);
  recordStore.addRecord(props.activity_id, start, end);
}
</script>

<template>
  <div class="activity row items-center">
    <div class="col">
      <q-badge
        :style="{
          'background-color': categoryColor,
        }"
        >{{ categoryName }}</q-badge
      >
      <div class="row text-h6">{{ props.activity_data.label }}</div>
    </div>
    <div class="col-4">{{ props.activity_data.label }}</div>
    <div class="col">{{ props.activity_data.desc }}</div>
    <q-btn
      @click="userStore.startOngoingActivity(props.activity_id)"
      round
      color="primary"
      flat
      icon="play_arrow"
    />
    <q-btn round color="primary" flat icon="pause" />
    <q-btn
      @click="addRecordForTesting"
      round
      color="primary"
      flat
      icon="stop"
    />
    <q-btn round color="primary" flat icon="edit" />
    <q-btn round color="primary" flat icon="more_vert" />
  </div>
</template>
