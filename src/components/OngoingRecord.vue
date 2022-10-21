<script setup lang="ts">
import { computed, onBeforeMount, onUnmounted, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useActivityStore } from 'src/stores/activity-store';
import { useRecordStore } from 'src/stores/record-store';
import { useUserDataStore } from 'src/stores/user-data-store';
import TimeDisplay from 'src/components/TimeDisplay.vue';

// =========================== Properties/Emitters =============================
// =========================== Use stores/composables ==========================
const userStore = useUserDataStore();
const activityStore = useActivityStore();
const recordStore = useRecordStore();

// =========================== Computed properties =============================
const activityName = computed(() => {
  if (!ongoing.value) return '';
  const data = activityStore.getActivityData(ongoing.value.aid);
  return data ? data.label : 'Unknown activity';
});

// =========================== Refs ============================================
const { ongoing } = storeToRefs(userStore);
const elapsed_ms = ref(0);
const memo = ref('');

// =========================== Methods =========================================
function updateElapsedTime() {
  if (ongoing.value) {
    let elapsed = new Date().getTime() - ongoing.value.start.toMillis();
    elapsed = Math.max(elapsed, 0);
    elapsed_ms.value = elapsed;
  }
}

function finishRecording() {
  recordStore.finishRecording();
}

function pauseRecording() {
  console.log('pauseRecording');
}

async function recordMemo() {
  await userStore.updateOngoingMemo(memo.value);
}

// =========================== Additional setup ================================
let timerId = 0;

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
</script>

<template>
  <q-card v-if="!!ongoing">
    <q-card-section>
      <div class="text-h6">{{ activityName }}</div>
    </q-card-section>
    <q-separator />
    <q-card-section class="row justify-end">
      <time-display :time="elapsed_ms"></time-display>
    </q-card-section>
    <q-card-section>
      <q-input
        v-model="memo"
        label="Memo"
        filled
        autogrow
        @blur="recordMemo"
      ></q-input>
    </q-card-section>
    <q-separator dark />
    <q-card-actions align="right">
      <q-btn round color="primary" flat icon="pause" @click="pauseRecording" />
      <q-btn round color="primary" flat icon="stop" @click="finishRecording" />
    </q-card-actions>
  </q-card>
</template>
