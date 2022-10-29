<script setup lang="ts">
import { computed, ref } from 'vue';
import { Timestamp } from '@firebase/firestore';
import { ActivityDoc, RecordDoc, RecordChange } from 'src/types/documents';
import { useActivityStore } from 'src/stores/activity-store';
import { useRecordStore } from 'src/stores/record-store';
import { useCategoryStore } from 'src/stores/category-store';
import TimeInput from 'src/components/TimeInput.vue';

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
const frames = ref(
  !props.doc
    ? []
    : !props.doc.data.subs
    ? [{ start: props.doc.data.start, end: props.doc.data.end }]
    : props.doc.data.subs
);

// =========================== Computed properties =============================
const earliestStart = computed(() => {
  let res = frames.value[0].start.toMillis();
  for (let i = 1; i < frames.value.length; i++) {
    res = Math.min(res, frames.value[i].start.toMillis());
  }
  return Timestamp.fromMillis(res);
});
const latestEnd = computed(() => {
  let res = frames.value[0].end.toMillis();
  for (let i = 1; i < frames.value.length; i++) {
    res = Math.max(res, frames.value[i].end.toMillis());
  }
  return Timestamp.fromMillis(res);
});
const totalDuration = computed(() => {
  let res = 0;
  for (const frame of frames.value) {
    res += frame.end.toMillis() - frame.start.toMillis();
  }
  return res;
});

// =========================== Methods =========================================
async function updateRecord() {
  if (!props.doc) {
    console.error('updateRecord() is called without base record data.');
    return;
  }
  const change = {} as RecordChange;
  const startTimestamp = earliestStart.value;
  if (startTimestamp !== props.doc.data.start) {
    change.start = startTimestamp;
  }
  const endTimestamp = latestEnd.value;
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
  const duration = totalDuration.value;
  if (duration != props.doc.data.duration) {
    change.duration = duration;
  }
  if (props.doc.data.subs) {
    change.subs = frames.value;
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

async function updateFrameStart(index: number, time: Date) {
  if (index >= frames.value.length) {
    console.error('index is OOB. index:', index, 'size:', frames.value.length);
    return;
  }
  frames.value[index].start = Timestamp.fromDate(time);
}

async function updateFrameEnd(index: number, time: Date) {
  if (index >= frames.value.length) {
    console.error('index is OOB. index:', index, 'size:', frames.value.length);
    return;
  }
  frames.value[index].end = Timestamp.fromDate(time);
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
    <q-card-section v-if="props.doc">
      <div
        v-for="(frame, i) in frames"
        :key="frame.start.toMillis()"
        class="row items-center"
      >
        <TimeInput
          :time="frame.start.toDate()"
          @on-change="updateFrameStart(i, $event)"
        />
        <div class="time-str">~</div>
        <TimeInput
          :time="frame.end.toDate()"
          :startTime="frame.start.toDate()"
          @on-change="updateFrameEnd(i, $event)"
        />
      </div>
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
