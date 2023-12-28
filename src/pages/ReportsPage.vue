<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { date, QPopupProxy } from 'quasar';
import { useUtil } from '@/composables/util';
import { useRecordStore } from '@/stores/record-store';
import { useAuthStore } from '@/stores/auth-store';
import { useOngoingStore } from '@/stores/ongoing-store';
import { useCacheStore } from '@/stores/cache-store';
import WeekBars from '@/components/WeekBars.vue';
import StatsBars from '@/components/StatsBars.vue';
import RecordList from '@/components/RecordList.vue';
import DateLabel from '@/components/DateLabel.vue';

const authStore = useAuthStore();
const recordStore = useRecordStore();
const ongoingStore = useOngoingStore();
const cacheStore = useCacheStore();
const { startOfMonth } = useUtil();

const { uid } = storeToRefs(authStore);
const { ongoing } = storeToRefs(ongoingStore);
const { requestedRecords } = storeToRefs(recordStore);
const { activities } = storeToRefs(cacheStore);

const activitiesToHide = ref([] as string[]);

const dateProxyRef = ref(null as QPopupProxy | null);
const dateRange = ref(
  {} as { from: string | undefined; to: string | undefined }
);
const editingFilter = ref(false);
const start = ref(startOfMonth(new Date()));
const end = computed(() =>
  date.addToDate(start.value, { months: 1, days: -1 })
);
const filteredRecords = computed(() => {
  const records = requestedRecords.value;
  return records.filter((record) => {
    return activitiesToHide.value.indexOf(record.data.aid) === -1;
  });
});

if (uid.value) {
  recordStore.requestMonthRecords(start.value);
} else {
  watch(uid, (uid) => {
    if (uid) {
      recordStore.requestMonthRecords(start.value);
    }
  });
}

watch(start, (start) => {
  recordStore.requestMonthRecords(start);
});

function goPrevWeek() {
  start.value = date.subtractFromDate(start.value, { months: 1 });
}

function goNextWeek() {
  start.value = date.addToDate(start.value, { months: 1 });
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
  start.value = startOfMonth(selectedDate);
  dateProxyRef.value?.hide();
}
</script>

<template>
  <q-page class="q-pa-md col items-center justify-evenly">
    <div class="row items-center">
      <div class="text-h4 q-pa-sm">{{ $t('monthlyReport') }}</div>
      <q-btn
        color="grey"
        flat
        rounded
        icon="filter_alt"
        :label="$t('filter')"
        size="md"
        class="q-ma-xs"
        @click="editingFilter = true"
      />
    </div>
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
      :days="31"
      :records="filteredRecords"
      :ongoing="ongoing || undefined"
    />
    <q-separator class="q-my-md" />
    <StatsBars
      :start="start"
      :end="date.addToDate(start, { months: 1 })"
      :records="filteredRecords"
    />
    <q-separator class="q-my-md" />
    <RecordList v-if="uid" :uid="uid" :records="filteredRecords" reverse />
  </q-page>

  <q-dialog v-model="editingFilter">
    <q-card class="q-pa-md">
      <q-card-section class="text-h6">{{ $t('actsToHide') }}</q-card-section>
      <div v-for="activity in activities" :key="activity.id">
        <q-checkbox v-model="activitiesToHide" :val="activity.id"></q-checkbox>
        {{ activity.data.label }}
      </div>
    </q-card>
  </q-dialog>
</template>
