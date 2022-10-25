<script setup lang="ts">
import { ref } from 'vue';
import { date } from 'quasar';
import ActivityList from 'src/components/ActivityList.vue';
import OngoingRecord from 'src/components/OngoingRecord.vue';
import WeekBars from 'src/components/WeekBars.vue';
import { useRecordStore } from 'src/stores/record-store';
import { storeToRefs } from 'pinia';
import { useUserDataStore } from 'src/stores/user-data-store';

const startHourOfDay = 5;
const startDayOfWeek = 1; // Monday

const now = new Date();
let startDate = date.startOfDate(now, 'day');
startDate = date.addToDate(startDate, { hours: startHourOfDay });
if (startDate.getTime() >= now.getTime()) {
  startDate = date.subtractFromDate(startDate, { days: 1 });
}
while (date.getDayOfWeek(startDate) != startDayOfWeek) {
  startDate = date.subtractFromDate(startDate, { days: 1 });
}
const start = ref(startDate);

const userStore = useUserDataStore();
const recordStore = useRecordStore();
const { records } = storeToRefs(recordStore);
const { ongoing } = storeToRefs(userStore);
</script>

<template>
  <q-page class="q-pa-md col items-center justify-evenly">
    <week-bars :start="start" :records="records" :ongoing="ongoing"></week-bars>
    <ongoing-record class="q-mt-md"></ongoing-record>
    <activity-list class="q-mt-md"></activity-list>
  </q-page>
</template>
