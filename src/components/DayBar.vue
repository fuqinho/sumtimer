<script setup lang="ts">
import { computed, watch, onBeforeMount, onUnmounted, ref } from 'vue';
import { date } from 'quasar';
import type { OngoingDocumentData, RecordDoc } from '@/types/documents';
import RecordBar from '@/components/RecordBar.vue';

// =========================== Properties/Emitters =============================
const props = defineProps<{
  start: Date;
  records: RecordDoc[];
  ongoing?: OngoingDocumentData;
}>();

// =========================== Use stores/composables ==========================

// =========================== Refs ============================================
const now = ref(Date.now());
const nowMarkerStyle = ref(null as { left: string } | null);

// =========================== Computed properties =============================
const ongoing = computed(() => props.ongoing);
function hasIntersection(s0: number, e0: number, s1: number, e1: number) {
  return s0 < e1 && s1 < e0;
}

const overlapRecords = computed(() => {
  const dayStart = props.start.getTime();
  const dayEnd = date.addToDate(props.start, { days: 1 }).getTime();
  const res = [] as RecordDoc[];
  for (const record of props.records) {
    const recStart = record.data.start.toMillis();
    const recEnd = record.data.end.toMillis();
    if (hasIntersection(recStart, recEnd, dayStart, dayEnd)) {
      res.push(record);
    }
  }
  return res;
});
const isOngoingOverlap = computed(() => {
  if (!ongoing.value) return false;

  const dayStart = props.start.getTime();
  const dayEnd = date.addToDate(props.start, { days: 1 }).getTime();
  const ongoingStart = ongoing.value.recStart.toMillis();
  const ongoingEnd = Date.now();
  return hasIntersection(ongoingStart, ongoingEnd, dayStart, dayEnd);
});
const dayStartMillis = computed(() => props.start.getTime());
const dayEndMillis = computed(() =>
  date.addToDate(props.start, { days: 1 }).getTime()
);

watch(ongoing, () => {
  updateBar();
});

let timerId = 0;
onBeforeMount(() => {
  updateBar();
  timerId = window.setInterval(updateBar, 10000);
});

onUnmounted(() => {
  clearInterval(timerId);
  timerId = 0;
});

function updateBar() {
  const dayStart = props.start.getTime();
  const dayEnd = date.addToDate(props.start, { days: 1 }).getTime();

  now.value = Date.now();
  if (now.value >= dayStart && now.value < dayEnd) {
    const startHour = (now.value - dayStart) / (60 * 60 * 1000);
    const leftPercent = Math.round((startHour / 24) * 10000) / 100;
    nowMarkerStyle.value = { left: leftPercent + '%' };
  } else {
    nowMarkerStyle.value = null;
  }
}

const separationNum = 24;
const separatorStyles = computed(() => {
  const res = [];
  for (let i = 1; i < separationNum; i++) {
    const curPercent = (100 * i) / separationNum;
    res.push({ id: i, left: curPercent + '%' });
  }
  return res;
});

// =========================== Methods =========================================
// =========================== Additional setup ================================
</script>

<template>
  <div class="container">
    <div
      v-for="sep in separatorStyles"
      :key="sep.id"
      class="bar-separator"
      :style="sep"
    >
      <span class="bar-separator-circle"></span>
    </div>
    <RecordBar
      v-for="record in overlapRecords"
      :key="record.id"
      :day-start="dayStartMillis"
      :day-end="dayEndMillis"
      :doc="record"
    />
    <RecordBar
      v-if="isOngoingOverlap"
      :day-start="dayStartMillis"
      :day-end="dayEndMillis"
      :ongoing="props.ongoing"
      :now="now"
    />
    <q-icon
      v-if="nowMarkerStyle"
      color="orange"
      size="10px"
      name="tornado"
      class="now-marker-icon"
      :style="nowMarkerStyle"
    ></q-icon>
  </div>
</template>

<style lang="scss">
.container {
  background-color: rgba(0, 0, 0, 0.05);
  width: 100%;
  height: 16px;
  margin: 4px 0;
  position: relative;
}

.now-marker-icon {
  width: 0;
  height: 0;
  top: -13px;
  left: 50%;
}

.bar-separator {
  width: 0px;
  height: 0px;
  top: 8px;
  position: absolute;
}

.bar-separator-circle {
  border-radius: 50%;
  width: 4px;
  height: 4px;
  top: -2px;
  left: -2px;
  background-color: rgba(0, 0, 0, 0.07);
  position: absolute;
}
</style>
