<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  time: number;
}
const props = defineProps<Props>();

const secondMs = 1000;
const minuteMs = secondMs * 60;
const hourMs = minuteMs * 60;

const hour = computed(() => Math.floor(props.time / hourMs));
const minute = computed(() => Math.floor((props.time % hourMs) / minuteMs));
const second = computed(() => Math.floor((props.time % minuteMs) / secondMs));
</script>

<template>
  <div>
    <span v-if="hour" class="digit hour self-end">{{ hour }}</span>
    <span v-if="hour" class="colon hour self-end">:</span>
    <span v-if="hour" class="digit minute">
      {{ ('00' + minute).slice(-2) }}
    </span>
    <span v-else class="digit minute">{{ minute }}</span>
    <span class="colon minute">:</span>
    <span class="digit second">{{ ('00' + second).slice(-2) }}</span>
  </div>
</template>

<style>
.digit,
.colon {
  font-size: 30px;
  vertical-align: baseline;
  color: #333;
}

.digit.second,
.colon.minute {
  font-size: 22px;
  color: #555;
}

.colon {
  padding: 0 4px;
}
</style>
