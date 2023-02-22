<script setup lang="ts">
import { ref } from 'vue';
import { storeToRefs } from 'pinia';
import { date } from 'quasar';
import { useUtil } from '@/composables/util';
import { useRecordStore } from '@/stores/record-store';
import { useOngoingStore } from '@/stores/ongoing-store';
import { useAuthStore } from '@/stores/auth-store';
import ActivityList from '@/components/ActivityList.vue';
import OngoingRecord from '@/components/OngoingRecord.vue';
import WeekBars from '@/components/WeekBars.vue';
import LandingPane from '@/components/LandingPane.vue';
import { appVersion } from '@/common/constants';
import WeeklyProgress from '@/components/WeeklyProgress.vue';

const authStore = useAuthStore();
const { uid, isSignedIn, willBeSignedIn } = storeToRefs(authStore);
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
      <OngoingRecord v-if="ongoing" class="q-mb-md" :data="ongoing" />
      <WeekBars
        :start="start"
        :records="recentRecords"
        :ongoing="ongoing || undefined"
      />
      <WeeklyProgress
        :records="recentRecords"
        :start="start"
        :end="date.addToDate(start, { days: 7 })"
        :ongoing="ongoing || undefined"
      />
      <ActivityList v-if="uid" :uid="uid" class="q-mt-md" />
    </div>
    <div v-if="!isSignedIn && !willBeSignedIn">
      <LandingPane />
    </div>
    <q-separator class="q-mt-md q-mb-xs" />
    <div class="row justify-end">
      <a href="privacypolicy.html">Privacy</a>
      <span class="q-mx-xs">|</span>
      <a href="tos.html">Terms & conditions</a>
      <span class="q-mx-xs">|</span>
      <a href="https://github.com/fuqinho/sumtimer">GitHub</a>
      <span class="q-mx-xs">|</span>
      <a href="https://twitter.com/fuqinho">@fuqinho</a>
      <span class="q-mx-xs">|</span>
      <span>{{ appVersion }}</span>
    </div>
  </q-page>
</template>
