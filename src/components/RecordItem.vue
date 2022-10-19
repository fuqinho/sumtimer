<script setup lang="ts">
import { ref, computed } from 'vue';
import { deleteDoc, doc, getFirestore } from '@firebase/firestore';
import { RecordDocumentData } from 'src/common/types';
import { useTimeUtil } from 'src/composables/time-util';
import { useActivityStore } from 'src/stores/activity-store';
import { useUserDataStore } from 'src/stores/user-data-store';
import RecordForm from 'src/components/RecordForm.vue';

const userStore = useUserDataStore();
const activityStore = useActivityStore();
const timeUtil = useTimeUtil();

const activityName = computed(() => {
  console.log(props.record_data);
  if (props.record_data.aid) {
    const doc = activityStore.getActivityData(props.record_data.aid);
    if (doc) console.log('returning', doc.label);
    return doc ? doc.label : '';
  }
  return '';
});

interface Props {
  record_id: string;
  record_data: RecordDocumentData;
}

const props = defineProps<Props>();

const categoryColor = computed(() => {
  const aid = props.record_data.aid;
  if (aid) {
    const activity = activityStore.getActivityData(aid);
    if (activity && activity.cid) {
      const category = userStore.getCategoryData(activity.cid);
      if (category) {
        return category.color;
      }
    }
  }
  return '#234365';
});

const categoryName = computed(() => {
  const aid = props.record_data.aid;
  if (aid) {
    const activity = activityStore.getActivityData(aid);
    if (activity && activity.cid) {
      const category = userStore.getCategoryData(activity.cid);
      if (category) {
        return category.label;
      }
    }
  }
  return 'Unknown category';
});

const editing = ref(false);

async function deleteRecord() {
  await deleteDoc(doc(getFirestore(), 'records', props.record_id));
}

const hours = computed(() => {
  const duration_h = timeUtil.durationInHour(
    props.record_data.start,
    props.record_data.end
  );
  return (Math.ceil(duration_h * 100) / 100).toFixed(2);
});
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
        {{ props.record_data.start.toDate().toLocaleDateString() }}
      </q-item-label>
      <q-item-label caption>
        {{ props.record_data.start.toDate().toLocaleTimeString() }} -
        {{ props.record_data.end.toDate().toLocaleTimeString() }}
      </q-item-label>
    </q-item-section>
    <q-item-section>
      {{ props.record_data.memo }}
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
    <RecordForm
      :record_id="props.record_id"
      :record_data="props.record_data"
      @on-saved="editing = false"
    />
  </q-dialog>
</template>
