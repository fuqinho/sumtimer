<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useRecordStore } from 'src/stores/record-store';
import RecordItem from 'src/components/RecordItem.vue';
import { useRoute } from 'vue-router';
import { computed } from 'vue';

// =========================== Properties/Emitters =============================
// =========================== Use stores/composables ==========================
const recordStore = useRecordStore();
const route = useRoute();

// =========================== Computed properties =============================
const filteredRecords = computed(() => {
  if (route.params.aid) {
    // TODO: Filter by query to DB, instead of this local filter.
    return records.value.filter((r) => r.data.aid === route.params.aid);
  } else {
    return records.value;
  }
});

// =========================== Refs ============================================
const { records } = storeToRefs(recordStore);

// =========================== Methods =========================================
// =========================== Additional setup ================================
</script>

<template>
  <div>
    <q-list bordered separator>
      <RecordItem
        v-for="record in filteredRecords"
        :key="record.id"
        :doc="record"
      ></RecordItem>
    </q-list>
  </div>
</template>
