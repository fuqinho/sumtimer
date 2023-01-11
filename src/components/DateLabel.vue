<script setup lang="ts">
import { computed } from 'vue';
import { date } from 'quasar';

const props = defineProps<{
  day: Date;
  colored?: boolean;
  withYear?: boolean;
}>();

const weekColor = computed(() => {
  const dayOfWeek = date.getDayOfWeek(props.day);
  if (props.colored) {
    if (dayOfWeek === 7) return '#ff4444';
    if (dayOfWeek === 6) return '#4444ff';
  }
  return '#555';
});

const style = computed(() => {
  return { color: weekColor.value };
});
</script>

<template>
  <div :style="style" class="date-label">
    <span v-if="props.withYear" class="year">
      {{ date.formatDate(props.day, 'YYYY') }}
    </span>
    <span class="day">{{ date.formatDate(props.day, 'M/D') }}</span>
    <span class="week">{{ date.formatDate(props.day, 'ddd') }}</span>
  </div>
</template>

<style scoped>
.date-label {
  font-size: 16px;
  display: inline-block;
}

.year {
  font-size: 12px;
  opacity: 0.8;
  vertical-align: text-top;
  padding-right: 6px;
}

.week {
  padding-left: 3px;
  font-size: 10px;
  opacity: 0.7;
}
</style>
