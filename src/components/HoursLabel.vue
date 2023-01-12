<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  ms: number;
}>();
const HOUR_MS = 60 * 60 * 1000;
const intPart = computed(() => (props.ms / HOUR_MS).toFixed(1).split('.')[0]);
const fracPart = computed(() => (props.ms / HOUR_MS).toFixed(1).split('.')[1]);
</script>

<template>
  <div class="hour-label">
    <span class="int-part">{{ intPart }}</span>
    <span class="dot">.</span>
    <span class="frac-part">{{ fracPart }}</span>
  </div>
</template>

<style scoped>
.hour-label {
  display: inline-block;
}

.int-part {
  font-size: 18px;
}

[size='xs'] .int-part {
  font-size: 12px;
}

.dot,
.frac-part {
  font-size: 12px;
  opacity: 0.6;
}

[size='xs'] .dot,
[size='xs'] .frac-part {
  font-size: 8px;
  opacity: 0.6;
}
</style>
