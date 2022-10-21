<script setup lang="ts">
import { computed, ref } from 'vue';
import { Timestamp } from '@firebase/firestore';
import { ActivityDoc } from 'src/common/types';
import { useUserDataStore } from 'src/stores/user-data-store';
import { useRecordStore } from 'src/stores/record-store';
import { useRouter } from 'vue-router';
import ActivityForm from 'src/components/ActivityForm.vue';
import { useCategoryStore } from 'src/stores/category-store';
import {
  defaultCategoryColor,
  defaultCategoryName,
} from 'src/common/constants';

interface Props {
  doc: ActivityDoc;
}

const props = defineProps<Props>();

const userStore = useUserDataStore();
const categoryStore = useCategoryStore();
const recordStore = useRecordStore();
const router = useRouter();

const editing = ref(false);

const categoryName = computed(() => {
  const cid = props.doc.data.cid;
  if (cid) {
    const data = categoryStore.docData(cid);
    if (data) return data.label;
  }
  return defaultCategoryName;
});

const categoryColor = computed(() => {
  const cid = props.doc.data.cid;
  if (cid) {
    const data = categoryStore.docData(cid);
    if (data) return data.color;
  }
  return defaultCategoryColor;
});

const numRecords = computed(() => {
  const cache = props.doc.data.cache;
  if (cache && cache.numRecords) {
    return cache.numRecords;
  }
  return 0;
});

const totalHours = computed(() => {
  const cache = props.doc.data.cache;
  if (cache && cache.elapsedTime) {
    return (cache.elapsedTime / (60 * 60 * 1000)).toFixed(1);
  }
  return '0';
});

async function startActivity() {
  await userStore.startOngoingActivity(props.doc.id);
  router.push('/');
}

function addRecordForTesting() {
  const end = Timestamp.now();
  const start = Timestamp.fromMillis(end.toMillis() - 30 * 60 * 1000);
  recordStore.addRecord(props.doc.id, start, end);
}
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
      @click="startActivity"
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
        {{ props.doc.data.label }}
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
        <q-btn size="sm" @click="editing = true" round flat icon="edit" />
        <q-btn size="sm" @click="addRecordForTesting" round flat icon="stop" />
      </div>
    </q-item-section>
  </q-item>

  <q-dialog v-model="editing">
    <ActivityForm :doc="props.doc" @on-updated="editing = false" />
  </q-dialog>
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
