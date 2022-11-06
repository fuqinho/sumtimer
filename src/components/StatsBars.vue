<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { colors } from 'quasar';
import { useCacheStore } from 'src/stores/cache-store';
import { RecordDoc } from 'src/types/documents';
import { computed } from 'vue';
import { useUtil } from 'src/composables/util';

// =========================== Properties/Emitters =============================
interface Props {
  start: Date;
  end: Date;
  records: RecordDoc[];
}
const props = defineProps<Props>();

// =========================== Use stores/composables ==========================
const cacheStore = useCacheStore();
const { computeDuration, hourStr } = useUtil();

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

function actBarStyle(data: ActivityBarData) {
  const ccolor = idToCategory.value[idToActivity.value[data.aid].cid].color;
  const acolor = colors.lighten(ccolor, 80);
  const res = {
    width: (data.weekDuration * 100) / maxDuration.value + '%',
    backgroundColor: acolor,
  };
  return res;
}

// =========================== Methods =========================================
// =========================== Additional setup ================================
</script>

<template>
  <div class="column">
    <div
      v-for="catData in barData.catBars"
      :key="catData.cid"
      class="column cat-bar"
    >
      <div class="row">
        <div
          class="category-label"
          :style="{ color: idToCategory[catData.cid].color }"
        >
          {{ idToCategory[catData.cid].label }}
        </div>
        <div class="category-duration">
          {{ hourStr(catData.weekDuration) }}
        </div>
        <div class="bar-container col">
          <div class="category-bar" :style="catBarStyle(catData)"></div>
        </div>
      </div>
      <div
        v-for="actData in catData.actBars"
        :key="actData.aid"
        class="column act-bar"
      >
        <div class="row">
          <div class="activity-indent"></div>
          <div
            class="activity-label ellipsis"
            :style="{ color: idToCategory[catData.cid].color }"
          >
            {{ idToActivity[actData.aid].label }}
          </div>
          <div class="activity-duration">
            {{ hourStr(actData.weekDuration) }}
          </div>
          <div class="bar-container col">
            <div class="activity-bar" :style="actBarStyle(actData)"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.cat-bar {
  margin-top: 14px;
}

.act-bar {
  margin-top: 2px;
}

.category-label {
  width: 160px;
}

.activity-indent {
  width: 20px;
}

.activity-label {
  width: 140px;
}

.category-duration,
.activity-duration {
  width: 50px;
  text-align: right;
  padding-left: 8px;
  padding-right: 8px;
  color: #555;
}

.bar-container {
  height: 20px;
}

.category-bar,
.activity-bar {
  height: 100%;
}
</style>
