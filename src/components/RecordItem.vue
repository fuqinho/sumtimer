<script setup lang="ts">
import { ref, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { colors, date } from 'quasar';
import type { RecordDoc } from '@/types/documents';
import { defaultCategoryColor, defaultCategoryName } from '@/common/constants';
import { useRecordStore } from '@/stores/record-store';
import { useCacheStore } from '@/stores/cache-store';
import RecordView from '@/components/RecordView.vue';
import TimeDisplay from '@/components/TimeDisplay.vue';

// =========================== Properties/Emitters =============================
const props = defineProps<{
  doc: RecordDoc;
}>();

// =========================== Use stores/composables ==========================

const recordStore = useRecordStore();
const cacheStore = useCacheStore();

// =========================== Refs ============================================
const { idToCategory, idToActivity } = storeToRefs(cacheStore);
const editing = ref(false);

// =========================== Computed properties =============================
const activityName = computed(() => {
  if (props.doc.data.aid) {
    const doc = idToActivity.value[props.doc.data.aid];
    return doc ? doc.label : '';
  }
  return '';
});

const categoryColor = computed(() => {
  const aid = props.doc.data.aid;
  if (aid) {
    const activity = idToActivity.value[aid];
    if (activity && activity.cid) {
      const category = idToCategory.value[activity.cid];
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
    const activity = idToActivity.value[aid];
    if (activity && activity.cid) {
      const category = idToCategory.value[activity.cid];
      if (category) {
        return category.label;
      }
    }
  }
  return defaultCategoryName;
});

const startDateStr = computed(() =>
  date.formatDate(props.doc.data.start.toDate(), 'M/D')
);

function timeStr(time: Date) {
  let hour = time.getHours();
  const minute = time.getMinutes();
  //  if (hour < startHourOfDay) hour += 24;
  return hour + ':' + ('00' + minute).slice(-2);
}
const startTimeStr = computed(() => timeStr(props.doc.data.start.toDate()));
const endTimeStr = computed(() => timeStr(props.doc.data.end.toDate()));

const bgColor = computed(() => colors.lighten(categoryColor.value, 90));

// =========================== Methods =========================================
async function deleteRecord() {
  await recordStore.deleteRecord(props.doc.id);
}

// =========================== Additional setup ================================
</script>

<template>
  <q-item :style="{ backgroundColor: bgColor }">
    <q-item-section class="activity-name col-auto">
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
    <q-item-section class="col">
      <q-item-label v-if="props.doc.data.memo" top>
        <q-icon name="notes" size="xs" color="grey" class="q-mr-xs"></q-icon>
        <span class="text-memo">{{ props.doc.data.memo }}</span>
      </q-item-label>
    </q-item-section>
    <q-item-section side class="record-time">
      <q-item-label overline>{{ startDateStr }}</q-item-label>
      <q-item-label>{{ startTimeStr }} - {{ endTimeStr }}</q-item-label>
    </q-item-section>
    <q-item-section side class="record-duration">
      <TimeDisplay :time="props.doc.data.duration" size="small" />
    </q-item-section>
    <q-item-section side>
      <q-btn
        dense
        round
        color="gray"
        flat
        icon="edit"
        size="sm"
        @click="editing = true"
      />
    </q-item-section>
    <q-item-section side>
      <q-btn
        dense
        round
        color="gray"
        flat
        icon="delete"
        size="sm"
        @click="deleteRecord"
      />
    </q-item-section>
  </q-item>
  <q-dialog v-model="editing">
    <RecordView :doc="props.doc" />
  </q-dialog>
</template>

<style scoped>
.activity-name {
  min-width: 160px;
}

.text-memo {
  font-size: 12px;
  color: #444;
}

.record-time {
  min-width: 100px;
}
.record-duration {
  width: 90px;
}
</style>
