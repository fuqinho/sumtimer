<script setup lang="ts">
import { computed, onBeforeMount, onUnmounted, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { colors } from 'quasar';
import { useOngoingStore } from 'src/stores/ongoing-store';
import TimeDisplay from 'src/components/TimeDisplay.vue';
import TimeInput from 'src/components/TimeInput.vue';

// =========================== Properties/Emitters =============================

// =========================== Use stores/composables ==========================
const ongoingStore = useOngoingStore();

// =========================== Refs ============================================
const { ongoing, activityName, categoryName, categoryColor } =
  storeToRefs(ongoingStore);
const elapsed_ms = ref(0);
const memo = ref('');

// =========================== Computed properties =============================
const ongoingStart = computed(() => ongoing.value?.start.toDate());

const lightenedCategoryColor = computed(() => {
  return colors.lighten(categoryColor.value, 90);
});

// =========================== Methods =========================================
function updateElapsedTime() {
  if (ongoing.value) {
    let elapsed = new Date().getTime() - ongoing.value.start.toMillis();
    elapsed = Math.max(elapsed, 0);
    elapsed_ms.value = elapsed;
  }
}

async function finishRecording() {
  await ongoingStore.finish();
}

async function pauseRecording() {
  console.log('pauseRecording');
}

async function recordMemo() {
  await ongoingStore.updateMemo(memo.value);
}

async function onChangeStartTime(time: Date) {
  await ongoingStore.updateStart(time);
}

// =========================== Additional setup ================================
watch(ongoing, () => {
  updateElapsedTime();
});

let timerId = 0;

onBeforeMount(() => {
  updateElapsedTime();
  timerId = window.setInterval(updateElapsedTime, 1000);
});

onUnmounted(() => {
  clearInterval(timerId);
  timerId = 0;
});
</script>

<template>
  <q-card :style="{ backgroundColor: lightenedCategoryColor }">
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
    <q-card-section v-if="ongoingStart" class="items-start">
      <div class="start-time row items-center">
        <TimeInput :time="ongoingStart" @on-change="onChangeStartTime" />
        <div class="time-str">~</div>
      </div>
      <q-input v-model="memo" label="Memo" autogrow @blur="recordMemo" />
    </q-card-section>
    <q-separator dark />
    <q-card-actions align="right">
      <q-btn round color="primary" flat icon="pause" @click="pauseRecording" />
      <q-btn round color="primary" flat icon="stop" @click="finishRecording" />
    </q-card-actions>
  </q-card>
</template>

<style lang="scss" scoped>
.time-str {
  margin-left: 2px;
  font-size: 20px;
  margin-right: 4px;
}
</style>
