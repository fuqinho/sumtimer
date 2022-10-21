<script setup lang="ts">
import { ref, computed } from 'vue';
import { deleteDoc, doc, getFirestore } from '@firebase/firestore';
import { RecordDoc } from 'src/common/types';
import { useTimeUtil } from 'src/composables/time-util';
import { useActivityStore } from 'src/stores/activity-store';
import RecordForm from 'src/components/RecordForm.vue';
import { useCategoryStore } from 'src/stores/category-store';
import {
  defaultCategoryColor,
  defaultCategoryName,
} from 'src/common/constants';

interface Props {
  doc: RecordDoc;
}
const props = defineProps<Props>();

const categoryStore = useCategoryStore();
const activityStore = useActivityStore();
const timeUtil = useTimeUtil();

const editing = ref(false);

const activityName = computed(() => {
  if (props.doc.data.aid) {
    const doc = activityStore.getActivityData(props.doc.data.aid);
    return doc ? doc.label : '';
  }
  return '';
});

const categoryColor = computed(() => {
  const aid = props.doc.data.aid;
  if (aid) {
    const activity = activityStore.getActivityData(aid);
    if (activity && activity.cid) {
      const category = categoryStore.docData(activity.cid);
      if (category) {
        return category.color;
      }
    }
  }
  return defaultCategoryColor;
});

const categoryName = computed(() => {
  const aid = props.doc.data.aid;
  if (aid) {
    const activity = activityStore.getActivityData(aid);
    if (activity && activity.cid) {
      const category = categoryStore.docData(activity.cid);
      if (category) {
        return category.label;
      }
    }
  }
  return defaultCategoryName;
});

const hours = computed(() => {
  const duration_h = timeUtil.durationInHour(
    props.doc.data.start,
    props.doc.data.end
  );
  return (Math.ceil(duration_h * 100) / 100).toFixed(2);
});

async function deleteRecord() {
  await deleteDoc(doc(getFirestore(), 'records', props.doc.id));
}
</script>

<template>
  <q-item>
    <q-item-section>
      <q-item-label
        ><q-badge
          :style="{
            'background-color': categoryColor,
          }"
          >{{ categoryName }}</q-badge
        ></q-item-label
      >
      <q-item-label>{{ activityName }}</q-item-label>
    </q-item-section>
    <q-item-section>
      <q-item-label caption>
        {{ props.doc.data.start.toDate().toLocaleDateString() }}
      </q-item-label>
      <q-item-label caption>
        {{ props.doc.data.start.toDate().toLocaleTimeString() }} -
        {{ props.doc.data.end.toDate().toLocaleTimeString() }}
      </q-item-label>
    </q-item-section>
    <q-item-section>
      {{ props.doc.data.memo }}
    </q-item-section>
    <q-item-section>{{ hours }}</q-item-section>
    <q-item-section side>
      <q-btn @click="editing = true" round color="gray" flat icon="edit" />
    </q-item-section>
    <q-item-section side>
      <q-btn @click="deleteRecord" round color="gray" flat icon="delete" />
    </q-item-section>
  </q-item>
  <q-dialog v-model="editing">
    <RecordForm :doc="props.doc" @on-saved="editing = false" />
  </q-dialog>
</template>
