<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useActivityStore } from 'src/stores/activity-store';
import { useUserDataStore } from 'src/stores/user-data-store';
import { computed, onBeforeMount, onUnmounted, ref } from 'vue';

const userStore = useUserDataStore();
const { ongoing } = storeToRefs(userStore);
const activityStore = useActivityStore();

const elapsed_h = ref(0);
const elapsed_m = ref(0);
const elapsed_s = ref(0);

const second_ms = 1000;
const minute_ms = second_ms * 60;
const hour_ms = minute_ms * 60;

let timerId = 0;

const activityName = computed(() => {
  if (!ongoing.value) return '';
  const data = activityStore.getActivityData(ongoing.value.aid);
  return data ? data.label : 'Unknown activity';
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
    console.log(ongoing.value);
    const elapsed = new Date().getTime() - ongoing.value.start.toMillis();
    console.log(elapsed);
    elapsed_h.value = Math.floor(elapsed / hour_ms);
    elapsed_m.value = Math.floor((elapsed % hour_ms) / minute_ms);
    elapsed_s.value = Math.floor((elapsed % minute_ms) / second_ms);
  }
}
</script>

<template>
  <div v-if="!!ongoing">
    <p>{{ activityName }}</p>
    <p>Elapsed: {{ elapsed_h }}:{{ elapsed_m }}:{{ elapsed_s }}</p>
    <q-btn label="Pause"></q-btn>
    <q-btn label="Finish"></q-btn>
  </div>
  <div v-else>There is no ongoing record.</div>
</template>
