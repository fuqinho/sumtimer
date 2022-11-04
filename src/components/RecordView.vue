<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useCacheStore } from 'src/stores/cache-store';
import { RecordChange, RecordDoc } from 'src/types/documents';
import { computed, ref } from 'vue';
import { colors } from 'quasar';
import { useUtil } from 'src/composables/util';
import TimeSectionInput from 'src/components/TimeSectionInput.vue';
import { useRecordStore } from 'src/stores/record-store';
import { Timestamp } from '@firebase/firestore';
import ActivityPicker from 'src/components/ActivityPicker.vue';

// =========================== Properties/Emitters =============================
interface Props {
  doc: RecordDoc;
}
const props = defineProps<Props>();

// =========================== Use stores/composables ==========================
const cacheStore = useCacheStore();
const recordStore = useRecordStore();
const { maxDate, minDate } = useUtil();

// =========================== Refs ============================================
const { idToCategory, idToActivity } = storeToRefs(cacheStore);
const aid = ref(props.doc.data.aid);
const subs = ref(
  props.doc.data.subs || [
    {
      start: props.doc.data.start,
      end: props.doc.data.end,
    },
  ]
);
const memo = ref(props.doc.data.memo);
const editingActivity = ref(false);

// =========================== Computed properties =============================
const activity = computed(() => idToActivity.value[aid.value]);
const category = computed(() => idToCategory.value[activity.value.cid]);
const bgColor = computed(() => colors.lighten(category.value.color, 90));
const hasChange = computed(() => {
  if (props.doc.data.aid != aid.value) return true;
  if (props.doc.data.memo != memo.value) return true;
  if (props.doc.data.subs) {
    if (props.doc.data.subs.length != subs.value.length) return true;
    for (let i = 0; i < subs.value.length; i++) {
      if (props.doc.data.subs[i].start !== subs.value[i].start) return true;
      if (props.doc.data.subs[i].end !== subs.value[i].end) return true;
    }
  } else {
    if (props.doc.data.start !== subs.value[0].start) return true;
    if (props.doc.data.end !== subs.value[0].end) return true;
  }
  return false;
});

// =========================== Methods =========================================

async function save() {
  const change = {} as RecordChange;

  if (props.doc.data.aid != aid.value) {
    change.aid = aid.value;
  }
  if (props.doc.data.memo != memo.value) {
    change.memo = memo.value;
  }
  let start = subs.value[0].start.toDate();
  let end = subs.value[0].end.toDate();
  let duration = 0;
  for (const sub of subs.value) {
    start = minDate(start, sub.start.toDate());
    end = maxDate(end, sub.end.toDate());
    duration += end.getTime() - start.getTime();
  }
  change.start = Timestamp.fromDate(start);
  change.end = Timestamp.fromDate(end);
  change.duration = duration;
  if (props.doc.data.subs) {
    change.subs = subs.value;
  }
  await recordStore.updateRecord(props.doc.id, change);
}

async function deleteRecord() {
  await recordStore.deleteRecord(props.doc.id);
}

function onChangeStart(index: number, time: Date) {
  subs.value[index].start = Timestamp.fromDate(time);
}

function onChangeEnd(index: number, time: Date) {
  subs.value[index].end = Timestamp.fromDate(time);
}

function onSelectActivity(activityId: string) {
  aid.value = activityId;
}

// =========================== Additional setup ================================
</script>

<template>
  <q-card class="root" :style="{ backgroundColor: bgColor }">
    <q-card-section>
      <q-badge :style="{ backgroundColor: category.color }">
        {{ category.label }}
      </q-badge>
      <div class="row items-center">
        <div class="activity-label">{{ activity.label }}</div>
        <q-btn
          flat
          round
          icon="edit"
          color="grey"
          size="sm"
          @click="editingActivity = true"
        />
      </div>
    </q-card-section>
    <q-separator />
    <q-card-section>
      <div v-for="(sub, i) in subs" :key="i">
        <TimeSectionInput
          :start="sub.start.toDate()"
          :end="sub.end.toDate()"
          @on-change-start="onChangeStart(i, $event)"
          @on-change-end="onChangeEnd(i, $event)"
        />
      </div>
    </q-card-section>
    <q-card-section>
      <q-input label="memo" v-model="memo" dense clearable autogrow></q-input>
    </q-card-section>
    <q-card-actions>
      <q-btn flat round icon="delete" color="negative" @click="deleteRecord" />
      <q-space />
      <q-btn v-if="hasChange" label="Cancel" flat v-close-popup />
      <q-btn v-else label="Close" flat v-close-popup />
      <q-btn
        v-if="hasChange"
        label="Save"
        color="primary"
        v-close-popup
        @click="save"
      />
    </q-card-actions>
  </q-card>

  <q-dialog v-model="editingActivity">
    <ActivityPicker :aid="props.doc.data.aid" @on-select="onSelectActivity" />
  </q-dialog>
</template>

<style scoped>
.root {
  width: 100%;
}
.activity-label {
  font-size: 20px;
}

.edit-act-icon {
  color: #444;
  margin: 0 4px;
}
</style>