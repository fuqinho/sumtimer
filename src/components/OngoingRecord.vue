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
const lightenedCategoryColor = computed(() => {
  return colors.lighten(categoryColor.value, 90);
});

// =========================== Methods =========================================
function updateElapsedTime() {
  elapsed_ms.value = ongoingStore.totalDuration();
}

async function recordMemo() {
  await ongoingStore.updateMemo(memo.value);
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
  <q-card v-if="ongoing" :style="{ backgroundColor: lightenedCategoryColor }">
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
    <q-card-section class="items-start">
      <div v-if="ongoing.subs">
        <div
          v-for="(sub, i) in ongoing.subs"
          :key="sub.start.toMillis()"
          class="start-time row items-center"
        >
          <TimeInput
            :time="sub.start.toDate()"
            @on-change="ongoingStore.updateSubStart(i, $event)"
          />
          <div class="time-str">~</div>
          <TimeInput
            :time="sub.end.toDate()"
            :startTime="sub.start.toDate()"
            @on-change="ongoingStore.updateSubEnd(i, $event)"
          />
        </div>
      </div>
      <div v-if="ongoing.curStart">
        <div class="start-time row items-center">
          <TimeInput
            :time="ongoing.curStart.toDate()"
            @on-change="ongoingStore.updateCurStart"
          />
          <div class="time-str">~</div>
        </div>
      </div>
      <q-input v-model="memo" label="Memo" autogrow @blur="recordMemo" />
    </q-card-section>
    <q-separator dark />
    <q-card-actions align="right">
      <q-btn
        v-if="ongoing.curStart"
        round
        color="primary"
        flat
        icon="pause"
        @click="ongoingStore.pause()"
      />
      <q-btn
        v-else
        round
        color="primary"
        flat
        icon="play_arrow"
        @click="ongoingStore.resume()"
      />
      <q-btn
        round
        color="primary"
        flat
        icon="stop"
        @click="ongoingStore.finish()"
      />
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
