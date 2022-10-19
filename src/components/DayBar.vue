<script setup lang="ts">
import { computed } from 'vue';
import { date } from 'quasar';
import { RecordData } from 'src/common/types';
import { useActivityStore } from 'src/stores/activity-store';
import { useUserDataStore } from 'src/stores/user-data-store';

interface Props {
  start: Date;
  records: RecordData[];
}
const props = defineProps<Props>();

const activityStore = useActivityStore();
const userStore = useUserDataStore();

interface BarData {
  rid: string;
  style: {
    left: string;
    width: string;
    backgroundColor: string;
  };
}

const bars = computed(() => {
  const dayStart = props.start;
  const dayEnd = date.addToDate(props.start, { days: 1 });
  const res = [] as BarData[];
  for (const record of props.records) {
    const recStart = record.data.start.toMillis();
    const recEnd = record.data.end.toMillis();
    if (recEnd > dayStart.getTime() && recStart < dayEnd.getTime()) {
      const startTime = Math.max(recStart, dayStart.getTime());
      const endTime = Math.min(recEnd, dayEnd.getTime());
      const startHour = (startTime - dayStart.getTime()) / (60 * 60 * 1000);
      const leftPercent = Math.round((startHour / 24) * 10000) / 100;
      const durationHour = (endTime - startTime) / (60 * 60 * 1000);
      const widthPercent = Math.round((durationHour / 24) * 10000) / 100;
      const data = {
        rid: record.id,
        style: {
          left: leftPercent + '%',
          width: widthPercent + '%',
          backgroundColor: 'blue',
        },
      };
      if (record.data.aid) {
        const activityData = activityStore.getActivityData(record.data.aid);
        if (activityData && activityData.cid) {
          const categoryData = userStore.getCategoryData(activityData.cid);
          if (categoryData && categoryData.color) {
            data.style.backgroundColor = categoryData.color;
          }
        }
      }
      res.push(data);
    }
  }
  return res;
});
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
