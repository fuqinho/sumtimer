<script setup lang="ts">
import { Timestamp } from '@firebase/firestore';
import { storeToRefs } from 'pinia';
import { colors } from 'quasar';
import { defaultCategoryColor } from 'src/common/constants';
import { OngoingDocumentData, RecordDoc } from 'src/common/types';
import { useActivityStore } from 'src/stores/activity-store';
import { useCategoryStore } from 'src/stores/category-store';
import { computed } from 'vue';

interface Props {
  dayStart: number;
  dayEnd: number;
  doc?: RecordDoc;
  ongoing?: OngoingDocumentData;
  now?: number;
}
const props = defineProps<Props>();

const categoryStore = useCategoryStore();
const activityStore = useActivityStore();

const { idToCategory } = storeToRefs(categoryStore);
const { idToActivity } = storeToRefs(activityStore);

const categoryColor = computed(() => {
  const aid =
    (props.doc && props.doc.data.aid) || (props.ongoing && props.ongoing.aid);
  if (aid) {
    const activity = idToActivity.value[aid];
    if (activity) {
      const cid = activity.cid;
      if (cid) {
        const category = idToCategory.value[cid];
        if (category) {
          return category.color;
        }
      }
    }
  }
  return defaultCategoryColor;
});

const lightCategoryColor = computed(
  //() => colors.lighten(categoryColor.value, 90)
  () => colors.changeAlpha(categoryColor.value + 'ff', -0.88)
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
  <div class="container" :style="containerStyle">
    <div
      class="sub"
      v-for="(sub, i) in subs"
      :key="sub.start.toMillis()"
      :style="subStyles[i]"
    ></div>

    <div class="sub"></div>
  </div>
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
}

.container:hover {
  box-shadow: $shadow-2;
}

.sub {
  top: 0;
  position: absolute;
  height: 100%;
}
</style>
