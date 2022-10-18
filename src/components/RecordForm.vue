<script setup lang="ts">
import { ref, computed } from 'vue';
import { Timestamp } from '@firebase/firestore';
import { RecordDocumentData } from 'src/common/types';
import { useActivityStore } from 'src/stores/activity-store';
import { useRecordStore } from 'src/stores/record-store';
import DateTimeInput from 'src/components/DateTimeInput.vue';

interface Props {
  record_id?: string;
  record_data?: RecordDocumentData;
}
const props = defineProps<Props>();
const emit = defineEmits(['onSaved']);

const recordStore = useRecordStore();
const activityStore = useActivityStore();
const startTime = ref(
  props.record_data ? props.record_data.start.toDate() : new Date()
);
const endTime = ref(
  props.record_data ? props.record_data.end.toDate() : new Date()
);

const is_new = computed(() => {
  return !props.record_id;
});

const title = computed(() => {
  return is_new.value ? 'Create a record' : activityName;
});

const activityData = computed(() => {
  if (props.record_data && props.record_data.aid) {
    return activityStore.getActivityData(props.record_data.aid) || null;
  }
  return null;
});

const activityName = computed(() => {
  return activityData.value ? activityData.value.label : 'Unknown activity';
});

async function updateRecord() {
  if (props.record_id && props.record_data) {
    const newData = props.record_data;
    newData.start = Timestamp.fromDate(startTime.value);
    newData.end = Timestamp.fromDate(endTime.value);
    await recordStore.updateRecord(props.record_id, newData);
    emit('onSaved');
  }
}
</script>

<template>
  <q-card>
    <q-card-section>{{ title }}</q-card-section>
    <q-card-section>
      <date-time-input v-model:time="startTime" />
      <date-time-input v-model:time="endTime" />
    </q-card-section>
    <q-card-actions align="right">
      <q-btn label="Cancel" flat v-close-popup></q-btn>
      <q-btn label="Save" color="primary" @click="updateRecord"></q-btn>
    </q-card-actions>
  </q-card>
</template>
