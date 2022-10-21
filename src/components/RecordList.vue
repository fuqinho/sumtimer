<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useRecordStore } from 'src/stores/record-store';
import RecordItem from 'src/components/RecordItem.vue';

const recordStore = useRecordStore();
const { records } = storeToRefs(recordStore);
</script>

<template>
  <div class="q-pa-md" q-pa-md>
    <q-list bordered separator>
      <RecordItem
        v-for="record in records"
        :key="record.id"
        :doc="record"
      ></RecordItem>
    </q-list>
  </div>
</template>
