<script setup lang="ts">
import { ref, watch } from 'vue';
import { date } from 'quasar';
import { useUtil } from 'src/composables/util';
import { useRecordStore } from 'src/stores/record-store';
import { storeToRefs } from 'pinia';

import { useAuthStore } from 'src/stores/auth-store';
import { useOngoingStore } from 'src/stores/ongoing-store';
import WeekBars from 'src/components/WeekBars.vue';
import StatsBars from 'src/components/StatsBars.vue';

const authStore = useAuthStore();
const recordStore = useRecordStore();
const ongoingStore = useOngoingStore();
const { startOfWeek } = useUtil();

const { uid } = storeToRefs(authStore);
const { ongoing } = storeToRefs(ongoingStore);
const { requestedRecords } = storeToRefs(recordStore);

const start = ref(startOfWeek(new Date()));
if (uid.value) {
  recordStore.requestRecords(start.value);
} else {
  watch(uid, (uid) => {
    if (uid) {
      recordStore.requestRecords(start.value);
    }
  });
}

function goPrevWeek() {
  start.value = date.subtractFromDate(start.value, { days: 7 });
  recordStore.requestRecords(start.value);
}

function goNextWeek() {
  start.value = date.addToDate(start.value, { days: 7 });
  recordStore.requestRecords(start.value);
}
</script>

<template>
  <q-page class="q-pa-md col items-center justify-evenly">
    <q-btn @click="goPrevWeek">Prev</q-btn>
    <q-btn @click="goNextWeek">Next</q-btn>
    <WeekBars
      :start="start"
      :records="requestedRecords"
      :ongoing="ongoing || undefined"
    />
    <q-separator class="q-my-md" />
    <StatsBars
      :start="start"
      :end="date.addToDate(start, { days: 7 })"
      :records="requestedRecords"
    />
  </q-page>
</template>
