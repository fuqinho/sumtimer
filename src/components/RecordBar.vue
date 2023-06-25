<script setup lang="ts">
import { computed, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { colors } from 'quasar';
import { Timestamp } from 'firebase/firestore';
import type { OngoingDocumentData, RecordDoc } from '@/types/documents';
import { defaultActivityName, defaultCategoryColor } from '@/common/constants';
import { useCacheStore } from '@/stores/cache-store';
import RecordView from '@/components/RecordView.vue';
import { useUtil } from '@/composables/util';

const props = defineProps<{
  dayStart: number;
  dayEnd: number;
  doc?: RecordDoc;
  ongoing?: OngoingDocumentData;
  now?: number;
}>();

const cacheStore = useCacheStore();
const { lcl } = useUtil();

const { idToCategory, idToActivity } = storeToRefs(cacheStore);
const editing = ref(false);

const activity = computed(() => {
  const aid =
    (props.doc && props.doc.data.aid) || (props.ongoing && props.ongoing.aid);
  return aid && idToActivity.value[aid] ? idToActivity.value[aid] : null;
});

const activityName = computed(() => {
  if (activity.value) {
    return activity.value.label;
  }
  return defaultActivityName;
});

const categoryColor = computed(() => {
  if (activity.value) {
    const cid = activity.value.cid;
    if (cid) {
      const category = idToCategory.value[cid];
      if (category) {
        return category.color;
      }
    }
  }

  return defaultCategoryColor;
});

const lightCategoryColor = computed(
  //() => colors.lighten(categoryColor.value, 90)
  () => colors.changeAlpha(categoryColor.value + 'ff', -0.8)
);

const containerStyle = computed(() => {
  let recStart = 0;
  let recEnd = 1;
  if (props.doc) {
    recStart = props.doc.data.start.toMillis();
    recEnd = props.doc.data.end.toMillis();
  } else if (props.ongoing) {
    recStart = props.ongoing.recStart.toMillis();
    recEnd = props.now || Date.now();
  }
  recStart = Math.max(recStart, props.dayStart);
  recEnd = Math.min(recEnd, props.dayEnd);
  const total = 24 * 60 * 60 * 1000;

  const left = (recStart - props.dayStart) / total;
  const width = (recEnd - recStart) / total;
  if (props.ongoing) {
    return {
      left: left * 100 + '%',
      width: width * 100 + '%',
      backgroundColor: lightCategoryColor.value,
      outlineColor: 'rgba(255, 255, 0, 0.8)',
      outlineWidth: '2px',
      outlineStyle: 'solid',
    };
  } else {
    return {
      left: left * 100 + '%',
      width: width * 100 + '%',
      backgroundColor: lightCategoryColor.value,
    };
  }
});

const subStyles = computed(() => {
  let recStart = 0;
  let recEnd = 1;
  if (props.doc) {
    recStart = props.doc.data.start.toMillis();
    recEnd = props.doc.data.end.toMillis();
  } else if (props.ongoing) {
    recStart = props.ongoing.recStart.toMillis();
    recEnd = props.now || Date.now();
  }
  recStart = Math.max(recStart, props.dayStart);
  recEnd = Math.min(recEnd, props.dayEnd);
  const total = recEnd - recStart;

  return subs.value.map((sub) => {
    const subStart = Math.max(sub.start.toMillis(), props.dayStart);
    const subEnd = Math.min(sub.end.toMillis(), props.dayEnd);
    const left = (subStart - recStart) / total;
    const width = (subEnd - subStart) / total;
    return {
      left: left * 100 + '%',
      width: width * 100 + '%',
      backgroundColor: categoryColor.value,
    };
  });
});

const subs = computed(() => {
  if (props.doc) {
    if (props.doc.data.subs) return props.doc.data.subs;
    else return [{ start: props.doc.data.start, end: props.doc.data.end }];
  }
  if (props.ongoing) {
    let res = [] as { start: Timestamp; end: Timestamp }[];
    if (props.ongoing.subs) res = res.concat(props.ongoing.subs);
    if (props.ongoing.curStart) {
      res.push({
        start: props.ongoing.curStart,
        end: props.now ? Timestamp.fromMillis(props.now) : Timestamp.now(),
      });
    }
    return res;
  }
  return [];
});
</script>

<template>
  <div class="container" :style="containerStyle" @click="editing = true">
    <div
      v-for="(sub, i) in subs"
      :key="sub.start.toMillis()"
      class="sub"
      :style="subStyles[i]"
    ></div>
    <q-tooltip>{{ lcl(activityName) }}</q-tooltip>
  </div>

  <q-dialog v-if="props.doc" v-model="editing">
    <RecordView :doc="props.doc" />
  </q-dialog>
</template>

<style lang="scss" scoped>
.container {
  top: 0;
  padding: 0;
  margin: 0;
  position: absolute;
  background-color: yellow;
  height: 100%;
  cursor: pointer;
  border-radius: 3px;
}

.container:hover {
  box-shadow: $shadow-2;
}

.sub {
  top: 0;
  position: absolute;
  height: 100%;
  border-radius: 3px;
}
</style>
