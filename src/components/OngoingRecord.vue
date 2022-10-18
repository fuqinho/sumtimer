<script setup lang="ts">
import { computed, onBeforeMount, onUnmounted, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useTimeUtil } from 'src/composables/time-util';
import { useActivityStore } from 'src/stores/activity-store';
import { useRecordStore } from 'src/stores/record-store';
import { useUserDataStore } from 'src/stores/user-data-store';

const timeUtil = useTimeUtil();
const userStore = useUserDataStore();
const { ongoing } = storeToRefs(userStore);
const activityStore = useActivityStore();
const recordStore = useRecordStore();

const elapsed_h = ref(0);
const elapsed_m = ref(0);
const elapsed_s = ref(0);

let timerId = 0;

const activityName = computed(() => {
  if (!ongoing.value) return '';
  const data = activityStore.getActivityData(ongoing.value.aid);
  return data ? data.label : 'Unknown activity';
});

watch(ongoing, () => {
  updateElapsedTime();
});

onBeforeMount(() => {
  updateElapsedTime();
  timerId = window.setInterval(updateElapsedTime, 1000);
});

onUnmounted(() => {
  clearInterval(timerId);
  timerId = 0;
});

function updateElapsedTime() {
  if (ongoing.value) {
    let elapsed = new Date().getTime() - ongoing.value.start.toMillis();
    elapsed = Math.max(elapsed, 0);
    const [h, m, s] = timeUtil.millisToHMS(elapsed);
    elapsed_h.value = h;
    elapsed_m.value = m;
    elapsed_s.value = s;
  }
}

function pauseRecording() {
  console.log('pauseRecording');
}
</script>

<template>
  <div v-if="!!ongoing">
    <p>{{ activityName }}</p>
    <p>Elapsed: {{ elapsed_h }}:{{ elapsed_m }}:{{ elapsed_s }}</p>
    <q-btn @click="pauseRecording" label="Pause"></q-btn>
    <q-btn @click="recordStore.finishRecording" label="Finish"></q-btn>
  </div>
  <div v-else>There is no ongoing record.</div>
</template>
