<script setup lang="ts">
import { computed, onBeforeMount, onUnmounted, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { colors, date } from 'quasar';
import { OngoingRecord } from 'src/common/types';
import { defaultCategoryColor } from 'src/common/constants';
import { useCategoryStore } from 'src/stores/category-store';
import { useActivityStore } from 'src/stores/activity-store';
import { useRecordStore } from 'src/stores/record-store';
import { useUserDataStore } from 'src/stores/user-data-store';
import TimeDisplay from 'src/components/TimeDisplay.vue';
import TimeInput from 'src/components/TimeInput.vue';

// =========================== Properties/Emitters =============================
const props = defineProps<{
  ongoing: OngoingRecord;
}>();

// =========================== Use stores/composables ==========================
const userStore = useUserDataStore();
const categoryStore = useCategoryStore();
const activityStore = useActivityStore();
const recordStore = useRecordStore();
const { lighten } = colors;

// =========================== Refs ============================================
const { idToActivity } = storeToRefs(activityStore);
const { idToCategory } = storeToRefs(categoryStore);
const elapsed_ms = ref(0);
const memo = ref('');
const start = ref('');

// =========================== Computed properties =============================
const ongoing = computed(() => props.ongoing);

const ongoingStart = computed(() => props.ongoing.start.toDate());

const activity = computed(() => {
  if (!ongoing.value) return null;
  return idToActivity.value[ongoing.value.aid];
});

const activityName = computed(() => {
  if (activity.value) return activity.value.label;
  return 'Uknown activity';
});

const category = computed(() => {
  if (!activity.value) return null;
  if (activity.value && activity.value.cid) {
    const data = idToCategory.value[activity.value.cid];
    if (data) return data;
  }
  return null;
});

const categoryName = computed(() => {
  return category.value ? category.value.label : 'Unknown category';
});

const categoryColor = computed(() => {
  return category.value ? category.value.color : defaultCategoryColor;
});

const lightenCategoryColor = computed(() => {
  return lighten(categoryColor.value, 90);
});

// =========================== Methods =========================================
function updateElapsedTime() {
  if (ongoing.value) {
    let elapsed = new Date().getTime() - ongoing.value.start.toMillis();
    elapsed = Math.max(elapsed, 0);
    elapsed_ms.value = elapsed;
  }
}

function updateStartTime() {
  if (ongoing.value) {
    start.value = date.formatDate(
      ongoing.value.start.toDate(),
      'YYYY-MM-DD HH:mm:ss'
    );
  }
}

function finishRecording() {
  recordStore.finishRecording();
}

function pauseRecording() {
  console.log('pauseRecording');
}

async function recordMemo() {
  await userStore.updateOngoingMemo(memo.value);
}

async function onChangeStartTime(time: Date) {
  console.log(time);
  await userStore.updateOngoingStartTime(time);
}

// =========================== Additional setup ================================
watch(ongoing, () => {
  updateStartTime();
  updateElapsedTime();
});

let timerId = 0;

onBeforeMount(() => {
  updateStartTime();
  updateElapsedTime();
  timerId = window.setInterval(updateElapsedTime, 1000);
});

onUnmounted(() => {
  clearInterval(timerId);
  timerId = 0;
});
</script>

<template>
  <q-card v-if="!!ongoing" :style="{ backgroundColor: lightenCategoryColor }">
    <q-card-section class="row">
      <div class="column items-start">
        <q-badge :style="{ backgroundColor: categoryColor }">{{
          categoryName
        }}</q-badge>
        <div class="text-h6">{{ activityName }}</div>
      </div>
      <q-space />
      <time-display :time="elapsed_ms"></time-display>
    </q-card-section>
    <q-separator />
    <q-card-section class="row justify-end"> </q-card-section>
    <q-card-section class="items-start">
      <div v-if="start">Start:</div>
      <div v-if="start" class="start-time row items-center">
        <TimeInput :time="ongoingStart" @on-change="onChangeStartTime" />
        <div class="time-str">~</div>
      </div>
      <q-input
        v-model="memo"
        label="Memo"
        autogrow
        @blur="recordMemo"
      ></q-input>
    </q-card-section>
    <q-separator dark />
    <q-card-actions align="right">
      <q-btn round color="primary" flat icon="pause" @click="pauseRecording" />
      <q-btn round color="primary" flat icon="stop" @click="finishRecording" />
    </q-card-actions>
  </q-card>
</template>

<style lang="scss" scoped>
.color-label {
  background-color: red;
  width: 10px;
  height: 100%;
}

date-time-input {
  width: 200px;
}

.day-str {
  font-size: 20px;
  margin-left: 2px;
  margin-right: 8px;
}

.time-str {
  margin-left: 2px;
  font-size: 20px;
  margin-right: 4px;
}
</style>
