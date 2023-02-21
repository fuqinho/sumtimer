<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { date, QPopupProxy } from 'quasar';
import { useUtil } from '@/composables/util';
import { useRecordStore } from '@/stores/record-store';
import { useAuthStore } from '@/stores/auth-store';
import { useOngoingStore } from '@/stores/ongoing-store';
import WeekBars from '@/components/WeekBars.vue';
import StatsBars from '@/components/StatsBars.vue';
import RecordList from '@/components/RecordList.vue';
import DateLabel from '@/components/DateLabel.vue';
import WeeklyProgress from '@/components/WeeklyProgress.vue';

const authStore = useAuthStore();
const recordStore = useRecordStore();
const ongoingStore = useOngoingStore();
const { startOfWeek } = useUtil();

const { uid } = storeToRefs(authStore);
const { ongoing } = storeToRefs(ongoingStore);
const { requestedRecords } = storeToRefs(recordStore);

const dateProxyRef = ref(null as QPopupProxy | null);
const dateRange = ref(
  {} as { from: string | undefined; to: string | undefined }
);
const start = ref(startOfWeek(new Date()));
const end = computed(() => date.addToDate(start.value, { days: 6 }));

if (uid.value) {
  recordStore.requestRecords(start.value);
} else {
  watch(uid, (uid) => {
    if (uid) {
      recordStore.requestRecords(start.value);
    }
  });
}

watch(start, (start) => {
  recordStore.requestRecords(start);
});

function goPrevWeek() {
  start.value = date.subtractFromDate(start.value, { days: 7 });
}

function goNextWeek() {
  start.value = date.addToDate(start.value, { days: 7 });
}

function onBeforeShowCalendar() {
  dateRange.value = {
    from: date.formatDate(start.value, 'YYYY/MM/DD'),
    to: date.formatDate(end.value, 'YYYY/MM/DD'),
  };
}

function onRangeStart(from: { year: number; month: number; day: number }) {
  const selectedDate = date.extractDate(
    `${from.year}/${from.month}/${from.day}`,
    'YYYY/M/D'
  );
  start.value = startOfWeek(selectedDate);
  dateProxyRef.value?.hide();
}
</script>

<template>
  <q-page class="q-pa-md col items-center justify-evenly">
    <div v-if="uid" class="row items-center">
      <q-btn icon="event" size="sm" round flat>
        <q-popup-proxy
          ref="dateProxyRef"
          transition-show="scale"
          transition-hide="scale"
          @before-show="onBeforeShowCalendar"
        >
          <q-date
            v-model="dateRange"
            range
            first-day-of-week="1"
            today-btn
            @range-start="onRangeStart"
          ></q-date>
        </q-popup-proxy>
      </q-btn>
      <q-btn
        icon="navigate_before"
        size="sm"
        padding="xs"
        flat
        @click="goPrevWeek"
      />
      <div class="date-range row">
        <DateLabel :day="start" with-year />
        <q-icon name="horizontal_rule" class="q-pa-sm" />
        <DateLabel :day="end" />
      </div>
      <q-btn
        icon="navigate_next"
        size="sm"
        padding="xs"
        flat
        @click="goNextWeek"
      />
    </div>
    <WeekBars
      :start="start"
      :records="requestedRecords"
      :ongoing="ongoing || undefined"
    />
    <WeeklyProgress
      :records="requestedRecords"
      :start="start"
      :end="date.addToDate(start, { days: 7 })"
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
