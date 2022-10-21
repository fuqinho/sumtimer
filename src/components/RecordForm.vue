<script setup lang="ts">
import { ref } from 'vue';
import { Timestamp } from '@firebase/firestore';
import { ActivityDoc, RecordDoc, RecordChange } from 'src/common/types';
import { useActivityStore } from 'src/stores/activity-store';
import { useRecordStore } from 'src/stores/record-store';
import DateTimeInput from 'src/components/DateTimeInput.vue';
import { useCategoryStore } from 'src/stores/category-store';

// =========================== Properties/Emitters =============================
interface Props {
  doc?: RecordDoc;
}
const props = defineProps<Props>();
const emit = defineEmits(['onSaved']);

// =========================== Use stores/composables ==========================
const categoryStore = useCategoryStore();
const recordStore = useRecordStore();
const activityStore = useActivityStore();

// =========================== Computed properties =============================
// =========================== Refs ============================================
const selectedActivity = ref(null as { aid: string; label: string } | null);
const activityOptions = ref(
  activityStore.activities.map((activity) => {
    return {
      aid: activity.id,
      label: activity.data.label,
      category: categoryName(activity),
    };
  })
);
const memo = ref(props.doc && props.doc.data.memo ? props.doc.data.memo : '');
const startTime = ref(props.doc ? props.doc.data.start.toDate() : new Date());
const endTime = ref(props.doc ? props.doc.data.end.toDate() : new Date());

// =========================== Methods =========================================
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
    const data = categoryStore.docData(activity.data.cid);
    if (data && data.label) {
      return data.label;
    }
  }
  return undefined;
}

// =========================== Additional setup ================================
if (props.doc) {
  for (const option of activityOptions.value) {
    if (option.aid === props.doc.data.aid) {
      selectedActivity.value = option;
      break;
    }
  }
}
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
