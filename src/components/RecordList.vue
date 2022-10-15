<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useRecordStore } from 'src/stores/record-store';
import RecordItem from './RecordItem.vue';

const recordStore = useRecordStore();
const { records } = storeToRefs(recordStore);
</script>

<template>
  <RecordItem
    v-for="record in records"
    :key="record.id"
    :record_id="record.id"
    :record_data="record.data"
  ></RecordItem>
</template>
