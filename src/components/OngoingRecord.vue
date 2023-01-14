<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { date, colors } from 'quasar';
import { maxPauseDurationMs, maxRecentActRecords } from '@/common/constants';
import { useOngoingStore } from '@/stores/ongoing-store';
import TimeDisplay from '@/components/TimeDisplay.vue';
import TimeInput from '@/components/TimeInput.vue';
import { useRecordStore } from '@/stores/record-store';
import type { QueryDocumentSnapshot } from '@firebase/firestore';
import type {
  OngoingDocumentData,
  RecordDocumentData,
} from '@/types/documents';
import { useCacheStore } from '@/stores/cache-store';
import { useUtil } from '@/composables/util';

// =========================== Properties/Emitters =============================
const props = defineProps<{
  data: OngoingDocumentData;
}>();

// =========================== Use stores/composables ==========================
const ongoingStore = useOngoingStore();
const recordsStore = useRecordStore();
const cacheStore = useCacheStore();
const { lcl } = useUtil();

// =========================== Refs ============================================
const {
  ongoing,
  activityName,
  categoryName,
  categoryColor,
  elapsedMillis,
  pausedMillis,
} = storeToRefs(ongoingStore);
const { idToActivity } = storeToRefs(cacheStore);
const memo = ref(props.data.memo || '');
const recentRecs = ref([] as QueryDocumentSnapshot<RecordDocumentData>[]);

// =========================== Computed properties =============================
const lightenedCategoryColor = computed(() => {
  return colors.lighten(categoryColor.value, 90);
});
const cachedActivity = computed(() => {
  return idToActivity.value[props.data.aid];
});
const numRecords = computed(() => {
  return cachedActivity.value ? cachedActivity.value.count : 0;
});

// =========================== Methods =========================================
async function recordMemo() {
  console.log('recording memo...');
  await ongoingStore.updateMemo(memo.value);
}

// =========================== Additional setup ================================
watch(ongoing, (newOngoing) => {
  if (!newOngoing) return;
  const newMemo = newOngoing.memo || '';
  if (newMemo !== memo.value) {
    memo.value = newMemo;
  }
});

onMounted(async () => {
  recentRecs.value = await recordsStore.getRecentRecordsByActivityId(
    props.data.aid,
    maxRecentActRecords
  );
});
</script>

<template>
  <div>
    <q-card :style="{ backgroundColor: lightenedCategoryColor }">
      <q-card-section class="row">
        <div class="column items-start">
          <q-badge :style="{ backgroundColor: categoryColor }">
            {{ lcl(categoryName) }}
          </q-badge>
          <div class="text-h6">{{ lcl(activityName) }}</div>
        </div>
        <q-space />
        <div class="column items-end">
          <TimeDisplay :time="elapsedMillis" />
          <div
            v-if="pausedMillis > 0"
            class="row items-center"
            style="opacity: 0.7"
          >
            <q-icon class="q-mx-xs" name="pause" color="pink-7" />
            <TimeDisplay :time="pausedMillis" size="small" />
            <span class="q-mx-xs">/</span>
            <TimeDisplay :time="maxPauseDurationMs" size="small" />
          </div>
        </div>
      </q-card-section>
      <q-separator inset />
      <q-card-section class="row justify-end"> </q-card-section>
      <q-card-section class="items-start">
        <div v-if="props.data.subs">
          <div
            v-for="(sub, i) in props.data.subs"
            :key="sub.start.toMillis()"
            class="start-time row items-center"
          >
            <TimeInput
              :time="sub.start.toDate()"
              @on-change="ongoingStore.updateSubStart(i, $event)"
            />
            <div class="time-str">~</div>
            <TimeInput
              :time="sub.end.toDate()"
              :start-time="sub.start.toDate()"
              @on-change="ongoingStore.updateSubEnd(i, $event)"
            />
          </div>
        </div>
        <div v-if="props.data.curStart">
          <div class="start-time row items-center">
            <TimeInput
              :time="props.data.curStart.toDate()"
              @on-change="ongoingStore.updateCurStart"
            />
            <div class="time-str">~</div>
          </div>
        </div>
        <q-input
          v-model="memo"
          :label="$t('memo')"
          autogrow
          @blur="recordMemo"
        />
      </q-card-section>
      <q-separator dark />
      <q-card-actions align="right">
        <q-btn
          flat
          round
          icon="delete"
          color="negative"
          @click="ongoingStore.reset()"
        />
        <q-space />
        <q-btn
          v-if="props.data.curStart"
          round
          color="primary"
          flat
          icon="pause"
          @click="ongoingStore.pause()"
        />
        <q-btn
          v-else
          round
          color="primary"
          flat
          icon="play_arrow"
          @click="ongoingStore.resume()"
        />
        <q-btn
          round
          color="primary"
          flat
          icon="stop"
          @click="ongoingStore.finish()"
        />
      </q-card-actions>
    </q-card>
    <div class="on-right history shadow-1">
      <div class="column">
        <div
          v-for="rec in recentRecs"
          :key="rec.id"
          class="history-item row items-center no-wrap"
        >
          <div class="history-icon">
            <q-icon name="history" size="xs" />
          </div>
          <div class="history-date">
            <div class="date-label">
              <span>{{
                date.formatDate(rec.data().start.toDate(), 'M/D')
              }}</span>
              <span class="weekday-label">{{
                date.formatDate(rec.data().start.toDate(), 'ddd')
              }}</span>
            </div>
          </div>
          <div class="history-time">
            {{ date.formatDate(rec.data().start.toDate(), 'H:mm') }}
          </div>
          <div class="history-memo ellipsis">
            <q-icon
              v-if="rec.data().memo"
              name="notes"
              size="xs"
              color="grey"
              class="q-mr-xs"
            ></q-icon>
            {{ rec.data().memo }}
          </div>
          <div class="history-duration">
            <TimeDisplay
              class="history-duration-inner"
              :time="rec.data().duration"
              size="small"
            />
          </div>
        </div>
        <div
          v-if="numRecords > maxRecentActRecords"
          class="history-item-more column items-center no-wrap"
        >
          <router-link
            :to="{ name: 'ActivityRecords', params: { aid: props.data.aid } }"
          >
            {{ `All records (${numRecords})` }}
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.time-str {
  margin-left: 2px;
  font-size: 20px;
  margin-right: 4px;
}

.history {
  width: min-content;
  max-width: 80%;
  z-index: -1;
  margin-left: auto;
  border-radius: 4px;
  opacity: 0.8;
  padding-top: 4px;
  padding-bottom: 2px;
}

.history-item {
  max-width: 100%;
}

.history-icon {
  flex: none;
  width: 26px;
  text-align: center;
  opacity: 0.6;
}

.history-date {
  flex: none;
  width: 66px;
  text-align: right;
}

.history-time {
  flex: none;
  text-align: right;
  padding-left: 4px;
  width: 38px;
}

.history-memo {
  flex: 1 1 auto;
  padding: 0 8px;
  min-width: 48px;
}

.history-duration {
  flex: none;
  width: 78px;
  text-align: right;
  padding-right: 8px;
}

.date-label {
  color: '##4444';
  font-size: 16px;
}

.weekday-label {
  padding-left: 3px;
  font-size: 10px;
  opacity: 0.7;
  width: 22px;
  display: inline-block;
  text-align: left;
}
</style>
