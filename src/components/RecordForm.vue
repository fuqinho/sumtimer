<script setup lang="ts">
import { ref } from 'vue';
import { Timestamp } from '@firebase/firestore';
import { RecordDocumentData, ActivityData } from 'src/common/types';
import { useActivityStore } from 'src/stores/activity-store';
import { useRecordStore } from 'src/stores/record-store';
import DateTimeInput from 'src/components/DateTimeInput.vue';
import { useUserDataStore } from 'src/stores/user-data-store';

interface Props {
  record_id?: string;
  record_data?: RecordDocumentData;
}
const props = defineProps<Props>();
const emit = defineEmits(['onSaved']);

const userStore = useUserDataStore();
const recordStore = useRecordStore();
const activityStore = useActivityStore();
const startTime = ref(
  props.record_data ? props.record_data.start.toDate() : new Date()
);
const endTime = ref(
  props.record_data ? props.record_data.end.toDate() : new Date()
);

async function updateRecord() {
  if (props.record_id && props.record_data) {
    const newData = props.record_data;
    newData.start = Timestamp.fromDate(startTime.value);
    newData.end = Timestamp.fromDate(endTime.value);
    newData.aid = selectedActivity.value
      ? selectedActivity.value.aid
      : undefined;
    newData.memo = memo.value ? memo.value : undefined;
    await recordStore.updateRecord(props.record_id, newData);
    emit('onSaved');
  }
}

function categoryName(activity: ActivityData) {
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
if (props.record_data) {
  for (const option of activityOptions.value) {
    if (option.aid === props.record_data.aid) {
      selectedActivity.value = option;
      break;
    }
  }
}
const memo = ref(
  props.record_data && props.record_data.memo ? props.record_data.memo : ''
);
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
