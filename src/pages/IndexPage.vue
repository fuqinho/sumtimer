<script setup lang="ts">
import { ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useUtil } from '@/composables/util';
import { useRecordStore } from '@/stores/record-store';
import { useOngoingStore } from '@/stores/ongoing-store';
import { useAuthStore } from '@/stores/auth-store';
import ActivityList from '@/components/ActivityList.vue';
import OngoingRecord from '@/components/OngoingRecord.vue';
import WeekBars from '@/components/WeekBars.vue';

const authStore = useAuthStore();
const { uid, isSignedIn } = storeToRefs(authStore);
const { startOfWeek } = useUtil();

const start = ref(startOfWeek(new Date()));

const recordStore = useRecordStore();
const ongoingStore = useOngoingStore();
const { recentRecords } = storeToRefs(recordStore);
const { ongoing } = storeToRefs(ongoingStore);
</script>

<template>
  <q-page class="q-pa-md col items-center justify-evenly">
    <div v-if="isSignedIn">
      <week-bars
        :start="start"
        :records="recentRecords"
        :ongoing="ongoing || undefined"
      ></week-bars>
      <ongoing-record
        v-if="ongoing"
        class="q-mt-md"
        :data="ongoing"
      ></ongoing-record>
      <ActivityList v-if="uid" :uid="uid" class="q-mt-md" />
    </div>
    <q-separator class="q-mt-md q-mb-xs" />
    <div class="row justify-end">
      <a href="privacypolicy.html">Privacy policy</a>
      <span class="q-mx-sm">|</span>
      <a href="tos.html">Terms & conditions</a>
    </div>
  </q-page>
</template>
