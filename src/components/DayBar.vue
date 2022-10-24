<script setup lang="ts">
import { computed, watch, onBeforeMount, onUnmounted, ref } from 'vue';
import { date } from 'quasar';
import { OngoingRecord, RecordDoc } from 'src/common/types';
import { useActivityStore } from 'src/stores/activity-store';
import { useCategoryStore } from 'src/stores/category-store';
import { storeToRefs } from 'pinia';
import { defaultCategoryColor } from 'src/common/constants';

// =========================== Properties/Emitters =============================
interface Props {
  start: Date;
  records: RecordDoc[];
  ongoing?: OngoingRecord;
}
const props = defineProps<Props>();

// =========================== Use stores/composables ==========================
const categoryStore = useCategoryStore();
const activityStore = useActivityStore();
const ongoing = computed(() => props.ongoing);

// =========================== Computed properties =============================
interface BarData {
  rid?: string;
  style: {
    left: string;
    width: string;
    backgroundColor: string;
    outlineColor?: string;
    outlineWidth?: string;
    outlineStyle?: string;
  };
}

function hasIntersection(s0: number, e0: number, s1: number, e1: number) {
  return s0 < e1 && s1 < e0;
}

function barGeometry(
  recStart: number,
  recEnd: number,
  dayStart: number,
  dayEnd: number
): [number, number] {
  const startTime = Math.max(recStart, dayStart);
  const endTime = Math.min(recEnd, dayEnd);
  const startHour = (startTime - dayStart) / (60 * 60 * 1000);
  const leftPercent = Math.round((startHour / 24) * 10000) / 100;
  const durationHour = (endTime - startTime) / (60 * 60 * 1000);
  const widthPercent = Math.round((durationHour / 24) * 10000) / 100;
  return [leftPercent, widthPercent];
}

function barColor(aid?: string) {
  if (aid) {
    const activityData = idToActivity.value[aid];
    if (activityData && activityData.cid) {
      const categoryData = idToCategory.value[activityData.cid];
      if (categoryData && categoryData.color) {
        return categoryData.color;
      }
    }
  }
  return defaultCategoryColor;
}

const bars = computed(() => {
  const dayStart = props.start.getTime();
  const dayEnd = date.addToDate(props.start, { days: 1 }).getTime();
  const res = [] as BarData[];
  for (const record of props.records) {
    const recStart = record.data.start.toMillis();
    const recEnd = record.data.end.toMillis();
    if (hasIntersection(recStart, recEnd, dayStart, dayEnd)) {
      const [left, width] = barGeometry(recStart, recEnd, dayStart, dayEnd);
      const color = barColor(record.data.aid);
      res.push({
        rid: record.id,
        style: {
          left: left + '%',
          width: width + '%',
          backgroundColor: color,
        },
      });
    }
  }
  return res;
});

const ongoingBar = ref(null as BarData | null);
const nowMarkerStyle = ref(null as { left: string } | null);

watch(ongoing, () => {
  updateBar();
});

let timerId = 0;
onBeforeMount(() => {
  updateBar();
  timerId = window.setInterval(updateBar, 20000);
});

onUnmounted(() => {
  clearInterval(timerId);
  timerId = 0;
});

function updateBar() {
  const dayStart = props.start.getTime();
  const dayEnd = date.addToDate(props.start, { days: 1 }).getTime();
  if (ongoing.value) {
    const recStart = ongoing.value.start.toMillis();
    const recEnd = Date.now();
    if (hasIntersection(recStart, recEnd, dayStart, dayEnd)) {
      const [left, width] = barGeometry(recStart, recEnd, dayStart, dayEnd);
      const color = barColor(ongoing.value.aid);
      ongoingBar.value = {
        style: {
          left: left + '%',
          width: width + '%',
          backgroundColor: color,
          outlineColor: 'rgba(255, 255, 0, 0.8)',
          outlineWidth: '4px',
          outlineStyle: 'solid',
        },
      };
    }
  } else {
    ongoingBar.value = null;
  }

  const now = Date.now();
  if (now >= dayStart && now < dayEnd) {
    const startHour = (now - dayStart) / (60 * 60 * 1000);
    const leftPercent = Math.round((startHour / 24) * 10000) / 100;
    nowMarkerStyle.value = { left: leftPercent + '%' };
  } else {
    nowMarkerStyle.value = null;
  }
}

// =========================== Refs ============================================
const { idToCategory } = storeToRefs(categoryStore);
const { idToActivity } = storeToRefs(activityStore);

// =========================== Methods =========================================
// =========================== Additional setup ================================
</script>

<template>
  <div class="container">
    <div
      v-for="bar in bars"
      :key="bar.rid"
      class="bar"
      :style="bar.style"
    ></div>
    <div v-if="ongoingBar" class="bar" :style="ongoingBar.style"></div>
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

.bar {
  position: absolute;
  top: 0;
  height: 100%;
}

.bar:hover {
  box-shadow: $shadow-2;
  cursor: pointer;
}

.now-marker-icon {
  width: 0;
  height: 0;
  top: -13px;
  left: 50%;
}
</style>
