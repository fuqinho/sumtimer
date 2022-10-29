<script setup lang="ts">
import { ref } from 'vue';
import { date } from 'quasar';
import ActivityList from 'src/components/ActivityList.vue';
import OngoingRecord from 'src/components/OngoingRecord.vue';
import WeekBars from 'src/components/WeekBars.vue';
import { useRecordStore } from 'src/stores/record-store';
import { storeToRefs } from 'pinia';
import { useOngoingStore } from 'src/stores/ongoing-store';
import { startHourOfDay, startDayOfWeek } from 'src/common/constants';
import { useAuthStore } from 'src/stores/auth-store';

const authStore = useAuthStore();
const { uid } = storeToRefs(authStore);

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

const recordStore = useRecordStore();
const ongoingStore = useOngoingStore();
const { records } = storeToRefs(recordStore);
const { ongoing } = storeToRefs(ongoingStore);
</script>

<template>
  <q-page class="q-pa-md col items-center justify-evenly">
    <week-bars
      :start="start"
      :records="records"
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
