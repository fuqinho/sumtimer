<script setup lang="ts">
import { computed } from 'vue';

// =========================== Properties/Emitters =============================
const props = defineProps<{
  time: number;
  size?: string;
  whity?: boolean;
}>();

// =========================== Use stores/composables ==========================
// =========================== Computed properties =============================
const secondMs = 1000;
const minuteMs = secondMs * 60;
const hourMs = minuteMs * 60;

const hour = computed(() => Math.floor(props.time / hourMs));
const minute = computed(() => Math.floor((props.time % hourMs) / minuteMs));
const second = computed(() => Math.floor((props.time % minuteMs) / secondMs));

// =========================== Refs ============================================
// =========================== Methods =========================================
// =========================== Additional setup ================================
</script>

<template>
  <div :class="{ small: props.size === 'small', whity: props.whity }">
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

<style scoped>
.digit,
.colon {
  font-size: 32px;
  vertical-align: baseline;
  color: rgba(0, 0, 0, 0.75);
}

.digit.second,
.colon.minute {
  font-size: 22px;
  color: rgba(0, 0, 0, 0.65);
}

.colon {
  padding: 0 4px;
}

.small .digit,
.small .colon {
  font-size: 18px;
}

.small .digit.second,
.small .colon.minute {
  font-size: 14px;
}

.small .colon {
  padding: 0 1px;
}

.whity .digit,
.whity .colon {
  color: rgba(255, 255, 255, 0.95);
}

.whity .digit.second,
.whity .colon.minute {
  font-size: 22px;
  color: rgba(255, 255, 255, 0.8);
}
</style>
