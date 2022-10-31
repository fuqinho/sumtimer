<script setup lang="ts">
import { ref } from 'vue';
import ActivityList from 'src/components/ActivityList.vue';
import OngoingRecord from 'src/components/OngoingRecord.vue';
import WeekBars from 'src/components/WeekBars.vue';
import { useRecordStore } from 'src/stores/record-store';
import { storeToRefs } from 'pinia';
import { useOngoingStore } from 'src/stores/ongoing-store';
import { useAuthStore } from 'src/stores/auth-store';
import { useUtil } from 'src/composables/util';

const authStore = useAuthStore();
const { uid } = storeToRefs(authStore);
const { startOfWeek } = useUtil();

const start = ref(startOfWeek(new Date()));

const recordStore = useRecordStore();
const ongoingStore = useOngoingStore();
const { recentRecords } = storeToRefs(recordStore);
const { ongoing } = storeToRefs(ongoingStore);
</script>

<template>
  <q-page class="q-pa-md col items-center justify-evenly">
    <week-bars
      :start="start"
      :records="recentRecords"
      :ongoing="ongoing || undefined"
    ></week-bars>
    <ongoing-record
      v-if="ongoing"
      class="q-mt-md"
      :ongoing="ongoing"
    ></ongoing-record>
    <ActivityList v-if="uid" :uid="uid" class="q-mt-md" />
  </q-page>
</template>
