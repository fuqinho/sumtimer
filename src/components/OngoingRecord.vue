<script setup lang="ts">
import { computed, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { colors } from 'quasar';
import { maxPauseDurationMs } from '@/common/constants';
import { useOngoingStore } from '@/stores/ongoing-store';
import TimeDisplay from '@/components/TimeDisplay.vue';
import TimeInput from '@/components/TimeInput.vue';

// =========================== Properties/Emitters =============================

// =========================== Use stores/composables ==========================
const ongoingStore = useOngoingStore();

// =========================== Refs ============================================
const {
  ongoing,
  activityName,
  categoryName,
  categoryColor,
  elapsedMillis,
  pausedMillis,
} = storeToRefs(ongoingStore);
const memo = ref('');

// =========================== Computed properties =============================
const lightenedCategoryColor = computed(() => {
  return colors.lighten(categoryColor.value, 90);
});

// =========================== Methods =========================================
async function recordMemo() {
  await ongoingStore.updateMemo(memo.value);
}

// =========================== Additional setup ================================
</script>

<template>
  <q-card v-if="ongoing" :style="{ backgroundColor: lightenedCategoryColor }">
    <q-card-section class="row">
      <div class="column items-start">
        <q-badge :style="{ backgroundColor: categoryColor }">
          {{ categoryName }}
        </q-badge>
        <div class="text-h6">{{ activityName }}</div>
      </div>
      <q-space />
      <div class="column items-end">
        <time-display :time="elapsedMillis"></time-display>
        <div
          v-if="pausedMillis > 0"
          class="row items-center"
          style="opacity: 0.7"
        >
          <q-icon class="q-mx-xs" name="pause" color="pink-7" />
          <time-display :time="pausedMillis" size="small"></time-display>
          <span class="q-mx-xs">/</span>
          <time-display :time="maxPauseDurationMs" size="small"></time-display>
        </div>
      </div>
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
            :start-time="sub.start.toDate()"
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
