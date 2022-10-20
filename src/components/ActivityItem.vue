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

const numRecords = computed(() => {
  const cache = props.activity_data.cache;
  if (cache && cache.numRecords) {
    return cache.numRecords;
  }
  return -1;
});

const totalHours = computed(() => {
  const cache = props.activity_data.cache;
  if (cache && cache.elapsedTime) {
    return (cache.elapsedTime / (60 * 60 * 1000)).toFixed(1);
  }
  return '0';
});
</script>

<template>
  <q-item class="activity" dense>
    <div
      class="color-label"
      :style="{
        'background-color': categoryColor,
      }"
    ></div>
    <q-btn
      @click="userStore.startOngoingActivity(props.activity_id)"
      round
      :style="{ color: categoryColor }"
      flat
      icon="play_arrow"
    />
    <q-item-section>
      <q-item-label caption :style="{ color: categoryColor }">{{
        categoryName
      }}</q-item-label>
      <q-item-label class="activity-name">
        {{ props.activity_data.label }}
      </q-item-label>
    </q-item-section>
    <q-item-section side>
      <q-item-label caption>Times</q-item-label>
      <q-item-label class="records-num">{{ numRecords }}</q-item-label>
    </q-item-section>
    <q-item-section side>
      <q-item-label caption>Hours</q-item-label>
      <q-item-label class="total-hours">{{ totalHours }}</q-item-label>
    </q-item-section>
    <q-item-section side>
      <div class="text-grey-7 q-gutter-xs">
        <q-btn size="sm" round flat icon="edit" />
        <q-btn size="sm" @click="addRecordForTesting" round flat icon="stop" />
      </div>
    </q-item-section>
  </q-item>
</template>

<style>
.activity {
  padding: 0 !important;
}

.color-label {
  width: 8px;
  height: 42px;
  background-color: red;
}

.activity-name,
.records-num,
.total-hours {
  font-size: 16px;
  margin-top: 0 !important;
}

.records-num,
.total-hours {
  color: #444;
}
</style>
