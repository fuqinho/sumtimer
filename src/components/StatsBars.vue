<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { colors } from 'quasar';
import type { RecordDoc } from '@/types/documents';
import { useCacheStore } from '@/stores/cache-store';
import { useUtil } from '@/composables/util';
import HoursLabel from '@/components/HoursLabel.vue';

// =========================== Properties/Emitters =============================
const props = defineProps<{
  start: Date;
  end: Date;
  records: RecordDoc[];
}>();

// =========================== Use stores/composables ==========================
const cacheStore = useCacheStore();
const { computeDuration, lcl } = useUtil();

// =========================== Refs ============================================
const { idToCategory, idToActivity } = storeToRefs(cacheStore);

// =========================== Computed properties =============================
interface ActivityBarData {
  aid: string;
  weekDuration: number;
}

interface CategoryBarData {
  cid: string;
  actBars: ActivityBarData[];
  weekDuration: number;
}

interface DurationInfo {
  [key: string]: {
    acts: {
      [key: string]: {
        duration: number;
      };
    };
    duration: number;
  };
}

const records = computed(() => props.records);
const start = computed(() => props.start);
const end = computed(() => props.end);

const durationInfo = computed(() => {
  let cats = {} as DurationInfo;
  for (const rec of records.value) {
    const duration = computeDuration(rec.data, start.value, end.value);
    if (duration < 0) {
      console.log('data:', rec.data, 'start:', start.value, 'end:', end.value);
    }
    if (duration <= 0) continue;
    const aid = rec.data.aid;
    if (!aid || !idToActivity.value[aid]) continue;
    const cid = idToActivity.value[aid].cid;
    if (!cats[cid]) {
      cats[cid] = {
        acts: {},
        duration: 0,
      };
    }
    if (!cats[cid].acts[aid]) {
      cats[cid].acts[aid] = {
        duration: 0,
      };
    }
    cats[cid].duration += duration;
    cats[cid].acts[aid].duration += duration;
  }
  return cats;
});

const catBars = computed(() => {
  const res = [];
  const categories = durationInfo.value;
  for (const cid in categories) {
    const actBars = [];
    for (const aid in categories[cid].acts) {
      actBars.push({
        aid: aid,
        weekDuration: categories[cid].acts[aid].duration,
      });
      actBars.sort((a, b) => b.weekDuration - a.weekDuration);
    }
    res.push({
      cid: cid,
      weekDuration: durationInfo.value[cid].duration,
      actBars: actBars,
    });
  }
  res.sort((a, b) => b.weekDuration - a.weekDuration);
  return res;
});

const maxDuration = computed(() => {
  let res = 0;
  for (const cid in durationInfo.value) {
    res = Math.max(res, durationInfo.value[cid].duration);
  }
  return res;
});

const barData = computed(() => {
  return {
    catBars: catBars.value,
    maxDuration: maxDuration.value,
  };
});

function catBarStyle(data: CategoryBarData) {
  const res = {
    width: (data.weekDuration * 100) / maxDuration.value + '%',
    backgroundColor: idToCategory.value[data.cid].color,
  };
  return res;
}

function catDurStyle(data: CategoryBarData) {
  return {
    color: idToCategory.value[data.cid].color,
  };
}

function actBarStyle(data: ActivityBarData) {
  const ccolor = idToCategory.value[idToActivity.value[data.aid].cid].color;
  const acolor = colors.lighten(ccolor, 60);
  const res = {
    width: (data.weekDuration * 100) / maxDuration.value + '%',
    left: '100px',
    backgroundColor: acolor,
  };
  return res;
}

function actDurStyle(data: ActivityBarData) {
  const ccolor = idToCategory.value[idToActivity.value[data.aid].cid].color;
  const acolor = colors.lighten(ccolor, 60);
  return {
    color: acolor,
  };
}

// =========================== Methods =========================================
// =========================== Additional setup ================================
</script>

<template>
  <div class="column">
    <div v-for="catData in barData.catBars" :key="catData.cid" class="column">
      <div class="row items-center cat-bar">
        <div class="label-area row items-center">
          <div
            class="category-label ellipsis"
            :style="{ color: idToCategory[catData.cid].color }"
          >
            {{ lcl(idToCategory[catData.cid].label) }}
          </div>
          <div class="category-dur" :style="catDurStyle(catData)">
            <HoursLabel :ms="catData.weekDuration" class="q-px-sm" />
          </div>
        </div>

        <div class="bar-container col">
          <div class="category-bar" :style="catBarStyle(catData)"></div>
        </div>
        <div class="duration-area"></div>
      </div>
      <div
        v-for="actData in catData.actBars"
        :key="actData.aid"
        class="column act-bar"
      >
        <div class="row items-center">
          <div class="label-area row items-center">
            <div class="activity-indent"></div>
            <div
              class="activity-label ellipsis"
              :style="{ color: idToCategory[catData.cid].color }"
            >
              {{ lcl(idToActivity[actData.aid].label) }}
            </div>
            <div class="activity-dur" :style="actDurStyle(actData)">
              <HoursLabel
                :ms="actData.weekDuration"
                :style="{ color: idToCategory[catData.cid].color }"
                class="q-px-sm"
                size="sm"
              />
            </div>
          </div>
          <div class="bar-container-act col">
            <div class="activity-bar" :style="actBarStyle(actData)"></div>
          </div>
          <div class="duration-area"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cat-bar {
  margin-top: 14px;
}

.act-bar {
  margin-top: 0px;
}

.label-area {
  flex-wrap: nowrap;
  width: 25%;
  max-width: 320px;
  min-width: 200px;
}

.duration-area {
  width: 50px;
  flex: none;
}

.category-label {
  flex: auto;
  font-weight: 600;
}

.activity-indent {
  flex: none;
  width: 20px;
}

.activity-label {
  flex: auto;
  opacity: 0.8;
}

.category-dur {
  top: -3px;
  font-weight: 600;
  height: 24px;
}

.activity-dur {
  top: -3px;
  opacity: 0.8;
  height: 21px;
}

.bar-container {
  height: 20px;
  position: relative;
}

.bar-container-act {
  height: 14px;
  position: relative;
}

.category-bar {
  height: 20px;
}
.activity-bar {
  height: 18px;
}
</style>
