<script setup lang="ts">
import { ref, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { colors } from 'quasar';
import type { RecordDoc } from '@/types/documents';
import { defaultCategoryColor, defaultCategoryName } from '@/common/constants';
import { useRecordStore } from '@/stores/record-store';
import { useCacheStore } from '@/stores/cache-store';
import RecordView from '@/components/RecordView.vue';

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

const bgColor = computed(() => colors.lighten(categoryColor.value, 90));

const hours = computed(() => {
  const duration_h = props.doc.data.duration / (60 * 60 * 1000);
  return (Math.ceil(duration_h * 100) / 100).toFixed(2);
});

// =========================== Methods =========================================
async function deleteRecord() {
  await recordStore.deleteRecord(props.doc.id);
}

// =========================== Additional setup ================================
</script>

<template>
  <q-item :style="{ backgroundColor: bgColor }">
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
      <q-btn round color="gray" flat icon="edit" @click="editing = true" />
    </q-item-section>
    <q-item-section side>
      <q-btn round color="gray" flat icon="delete" @click="deleteRecord" />
    </q-item-section>
  </q-item>
  <q-dialog v-model="editing">
    <RecordView :doc="props.doc" />
  </q-dialog>
</template>
