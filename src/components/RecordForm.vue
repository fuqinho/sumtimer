<script setup lang="ts">
import { ref } from 'vue';
import { Timestamp } from '@firebase/firestore';
import { ActivityDoc, RecordDoc, RecordChange } from 'src/common/types';
import { useActivityStore } from 'src/stores/activity-store';
import { useRecordStore } from 'src/stores/record-store';
import DateTimeInput from 'src/components/DateTimeInput.vue';
import { useUserDataStore } from 'src/stores/user-data-store';

interface Props {
  doc?: RecordDoc;
}
const props = defineProps<Props>();
const emit = defineEmits(['onSaved']);

const userStore = useUserDataStore();
const recordStore = useRecordStore();
const activityStore = useActivityStore();

const startTime = ref(props.doc ? props.doc.data.start.toDate() : new Date());
const endTime = ref(props.doc ? props.doc.data.end.toDate() : new Date());

async function updateRecord() {
  if (!props.doc) {
    console.error('updateRecord() is called without base record data.');
    return;
  }
  const change = {} as RecordChange;
  const startTimestamp = Timestamp.fromDate(startTime.value);
  if (startTimestamp !== props.doc.data.start) {
    change.start = startTimestamp;
  }
  const endTimestamp = Timestamp.fromDate(endTime.value);
  if (endTimestamp !== props.doc.data.end) {
    change.end = endTimestamp;
  }
  if (
    selectedActivity.value &&
    selectedActivity.value.aid !== props.doc.data.aid
  ) {
    change.aid = selectedActivity.value.aid;
  }
  if (memo.value != props.doc.data.memo) {
    change.memo = memo.value;
  }
  await recordStore.updateRecord(props.doc.id, change);
  emit('onSaved');
}

function categoryName(activity: ActivityDoc) {
  if (activity.data.cid) {
    const data = userStore.getCategoryData(activity.data.cid);
    if (data && data.label) {
      return data.label;
    }
  }
  return undefined;
}

const activityOptions = ref(
  activityStore.activities.map((activity) => {
    return {
      aid: activity.id,
      label: activity.data.label,
      category: categoryName(activity),
    };
  })
);
const selectedActivity = ref(null as { aid: string; label: string } | null);
if (props.doc) {
  for (const option of activityOptions.value) {
    if (option.aid === props.doc.data.aid) {
      selectedActivity.value = option;
      break;
    }
  }
}
const memo = ref(props.doc && props.doc.data.memo ? props.doc.data.memo : '');
</script>

<template>
  <q-card>
    <q-card-section>Edit record</q-card-section>
    <q-separator />
    <q-card-section>
      <q-select
        filled
        v-model="selectedActivity"
        :options="activityOptions"
        label="Activity"
      >
        <template v-slot:option="scope">
          <q-item v-bind="scope.itemProps">
            <q-item-section>
              <q-item-label>
                {{ scope.opt.label }}
              </q-item-label>
              <q-item-label caption>
                {{ scope.opt.category }}
              </q-item-label>
            </q-item-section>
          </q-item>
        </template>
      </q-select>
    </q-card-section>
    <q-card-section>
      <date-time-input label="Start" v-model:time="startTime" />
    </q-card-section>
    <q-card-section>
      <date-time-input label="End" v-model:time="endTime" />
    </q-card-section>
    <q-card-section>
      <q-input v-model="memo" label="Memo" filled autogrow></q-input>
    </q-card-section>
    <q-card-actions align="right">
      <q-btn label="Cancel" flat v-close-popup></q-btn>
      <q-btn label="Save" color="primary" @click="updateRecord"></q-btn>
    </q-card-actions>
  </q-card>
</template>
