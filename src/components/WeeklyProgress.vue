<script setup lang="ts">
import { useCacheStore } from '@/stores/cache-store';
import { storeToRefs } from 'pinia';
import { computed } from 'vue';
import { colors } from 'quasar';
import HoursLabel from '@/components/HoursLabel.vue';
import type { OngoingDocumentData, RecordDoc } from '@/types/documents';
import { useUtil } from '@/composables/util';
import { useTimeStore } from '@/stores/time-store';

// =========================== Properties/Emitters =============================
const props = defineProps<{
  start: Date;
  end: Date;
  records: RecordDoc[];
  ongoing?: OngoingDocumentData;
}>();

// =========================== Use stores/composables ==========================
const cacheStore = useCacheStore();
const timeStore = useTimeStore();
const { computeDuration } = useUtil();

// =========================== Refs ============================================
const { categories, idToActivity } = storeToRefs(cacheStore);
const { nowMillis } = storeToRefs(timeStore);

// =========================== Computed properties =============================
const trackedCategories = computed(() =>
  categories.value.filter((e) => !!e.data.weekGoal)
);
const untrackedCategories = computed(() =>
  categories.value.filter((e) => !e.data.weekGoal)
);
const records = computed(() => props.records);
const start = computed(() => props.start);
const end = computed(() => props.end);
const recordsDurations = computed(() => {
  const res = {} as { [key: string]: number };
  for (const rec of records.value) {
    const cid = idToActivity.value[rec.data.aid].cid;
    if (!cid) continue;
    const duration = computeDuration(rec.data, start.value, end.value);
    if (res[cid] === undefined) {
      res[cid] = duration;
    } else {
      res[cid] += duration;
    }
  }
  return res;
});
const durations = computed(() => {
  const res = { ...recordsDurations.value };
  if (props.ongoing) {
    let add = 0;
    if (props.ongoing.subs) {
      for (const sub of props.ongoing.subs) {
        add += Math.max(
          0,
          Math.min(sub.end.toMillis(), end.value.getTime()) -
            Math.max(sub.start.toMillis(), start.value.getTime())
        );
      }
    }
    if (props.ongoing.curStart) {
      add += Math.max(
        0,
        Math.min(nowMillis.value, end.value.getTime()) -
          Math.max(props.ongoing.curStart.toMillis(), start.value.getTime())
      );
    }
    console.log(add);
    res[props.ongoing.cid] = (res[props.ongoing.cid] || 0) + add;
  }
  return res;
});

// =========================== Methods =========================================

// =========================== Additional setup ================================
</script>

<template>
  <div class="row items-center">
    <div
      v-for="cat in trackedCategories"
      :key="cat.id"
      class="q-pt-md q-mr-lg column items-center"
    >
      <q-circular-progress
        show-value
        :value="
          ((durations[cat.id] || 0) /
            (cat.data.weekGoal || 1) /
            (60 * 60 * 1000)) *
          100
        "
        size="56px"
        track-color="grey-3"
        :style="{ color: cat.data.color }"
      >
        <div class="column items-center">
          <HoursLabel
            :ms="durations[cat.id] || 0"
            class="progress-hours"
            :style="{ color: cat.data.color }"
          />
          <!--<div class="progress-hours">120</div>-->
          <q-icon class="divider" name="horizontal_rule" />
          <div class="goal-hours">{{ cat.data.weekGoal }}</div>
        </div>
      </q-circular-progress>
      <div class="cat-label" :style="{ color: cat.data.color }">
        {{ cat.data.label }}
      </div>
    </div>
    <q-space v-if="trackedCategories.length > 0" />
    <div
      v-for="cat in untrackedCategories"
      :key="cat.id"
      class="q-pt-md q-mx-sm column items-center"
    >
      <q-circular-progress
        show-value
        :value="100"
        size="56px"
        track-color="grey-3"
        :thickness="0.2"
        :style="{ color: colors.lighten(cat.data.color, 90) }"
      >
        <div class="column items-center">
          <HoursLabel
            :ms="durations[cat.id] || 0"
            :style="{ color: cat.data.color }"
          />
        </div>
      </q-circular-progress>
      <div class="cat-label" :style="{ color: cat.data.color }">
        {{ cat.data.label }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.progress-hours {
  padding-top: 4px;
}

.progress-hours-untracked {
  font-size: 16px;
}

.divider {
  height: 4px;
  color: #eeeeee;
}

.goal-hours {
  font-size: 12px;
  color: #bdbdbd;
}

.cat-label {
  padding-top: 4px;
  font-size: 12px;
}
</style>
