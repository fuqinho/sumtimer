<script setup lang="ts">
import { ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { date } from 'quasar';
import { useUtil } from '@/composables/util';
import { useRecordStore } from '@/stores/record-store';
import { useAuthStore } from '@/stores/auth-store';
import { useOngoingStore } from '@/stores/ongoing-store';
import WeekBars from '@/components/WeekBars.vue';
import StatsBars from '@/components/StatsBars.vue';
import RecordList from '@/components/RecordList.vue';

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
    <q-btn icon="navigate_before" size="sm" padding="xs" @click="goPrevWeek" />
    <q-btn icon="navigate_next" size="sm" padding="xs" @click="goNextWeek" />
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
    <q-separator class="q-my-md" />
    <RecordList v-if="uid" :uid="uid" :records="requestedRecords" />
  </q-page>
</template>
