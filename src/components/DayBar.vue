<script setup lang="ts">
import { computed } from 'vue';
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
  if (props.ongoing) {
    const recStart = props.ongoing.start.toMillis();
    const recEnd = Date.now();
    if (hasIntersection(recStart, recEnd, dayStart, dayEnd)) {
      const [left, width] = barGeometry(recStart, recEnd, dayStart, dayEnd);
      const color = barColor(props.ongoing.aid);
      res.push({
        style: {
          left: left + '%',
          width: width + '%',
          backgroundColor: color,
          outlineColor: 'rgba(255, 255, 0, 0.8)',
          outlineWidth: '4px',
          outlineStyle: 'solid',
        },
      });
    }
  }
  return res;
});

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
</style>
