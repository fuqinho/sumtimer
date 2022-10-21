<script setup lang="ts">
import { computed } from 'vue';
import { date } from 'quasar';
import { RecordDoc } from 'src/common/types';
import DayBar from 'src/components/DayBar.vue';

interface RowData {
  start: Date;
  label: string;
  labelStyle: {
    color: string;
  };
  weekLabel: string;
}

// =========================== Properties/Emitters =============================
interface Props {
  start: Date;
  records: RecordDoc[];
}
const props = defineProps<Props>();

// =========================== Use stores/composables ==========================
const rows = computed(() => {
  const result = [] as RowData[];
  for (let i = 0; i < 7; i++) {
    const start = date.addToDate(props.start, { days: i });
    //const label = date.formatDate(start, 'M/D(ddd)');
    const label = date.formatDate(start, 'M/D');
    const dayOfWeek = date.getDayOfWeek(start);
    let labelColor = '#555';
    if (dayOfWeek === 7) labelColor = '#ff4444';
    if (dayOfWeek === 6) labelColor = '#4444ff';
    const weekLabel = date.formatDate(start, 'ddd');
    const data = {
      start: start,
      label: label,
      labelStyle: { color: labelColor },
      weekLabel: weekLabel,
    };
    result.push(data);
  }
  return result;
});

const hours = computed(() => {
  const result = [] as { label: string; left: string }[];
  const startH = props.start.getHours();
  for (let i = 0; i < 8; i++) {
    const data = {
      label: '' + ((startH + i * 3) % 24),
      left: 12.5 * i + '%',
    };
    result.push(data);
  }
  return result;
});

// =========================== Computed properties =============================
// =========================== Refs ============================================
// =========================== Methods =========================================
// =========================== Additional setup ================================
</script>

<template>
  <div class="q-pa-md">
    <div>
      <div class="row items-center">
        <div class="date-label"></div>
        <div class="hours-container col">
          <div>
            <span
              v-for="hour in hours"
              :key="hour.label"
              :style="{ left: hour.left }"
              class="hour-anchor"
              >{{ hour.label }}</span
            >
          </div>
        </div>
      </div>
    </div>
    <div v-for="row in rows" :key="row.start.getTime()">
      <div class="row items-center">
        <div :style="row.labelStyle" class="date-label">
          <span>{{ row.label }}</span>
          <span class="week">{{ row.weekLabel }}</span>
        </div>
        <DayBar
          :start="row.start"
          :records="props.records"
          class="col"
        ></DayBar>
      </div>
    </div>
  </div>
</template>

<style>
.date-label {
  width: 70px;
  font-size: 16px;
}
.week {
  padding-left: 3px;
  font-size: 10px;
  opacity: 0.7;
}

.hours-container {
  position: relative;
  height: 14px;
  width: 100%;
}

.hour-anchor {
  position: absolute;
  text-align: center;
  color: #bbb;
  width: 0;
  font-size: 12px;
}
</style>
