<script setup lang="ts">
import { ref } from 'vue';
import { date, useQuasar } from 'quasar';
import type {
  PortableCategory,
  PortableActivity,
  PortableData,
} from '@/types/portable';
import { maxMemoLength, maxTimeFrames } from '@/common/constants';
import { useActivityStore } from '@/stores/activity-store';
import { useCategoryStore } from '@/stores/category-store';
import { useRecordStore } from '@/stores/record-store';
import { useAuthStore } from '@/stores/auth-store';
import { useCacheStore } from '@/stores/cache-store';

const authStore = useAuthStore();
const categoryStore = useCategoryStore();
const activityStore = useActivityStore();
const recordStore = useRecordStore();
const cacheStore = useCacheStore();
const $q = useQuasar();

const currentVersion = 1;
const uploadSizeLimit = 2 * 1024 * 1024;

const fileToImport = ref(null);

async function exportJson() {
  const activities = await activityStore.exportActivities();
  const categories = await categoryStore.exportCategories();
  const records = await recordStore.exportRecords();

  const exportData: PortableData = {
    version: currentVersion,
    categories: categories,
    activities: activities,
    records: records,
  };

  const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(
    JSON.stringify(exportData)
  )}`;
  const link = document.createElement('a');
  link.href = jsonString;
  link.download =
    'sumtimer-' + date.formatDate(Date.now(), 'YYYYMMDD-HHmm') + '.json';
  link.click();
}

function readAsText(file: File) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}

function isDate(o: object) {
  return o instanceof Date;
}

function isValid(data: PortableData) {
  if (data.version !== 1) return false;

  const categoryIds = new Set<string>();
  for (const c of data.categories) {
    if (!c.id) return false;
    if (!c.label) return false;
    if (!c.color) return false;
    if (categoryIds.has(c.id)) return false;
    categoryIds.add(c.id);
  }
  const activityIds = new Set<string>();
  for (const a of data.activities) {
    if (!a.id) return false;
    if (!a.label) return false;
    if (a.categoryId && !categoryIds.has(a.categoryId)) return false;
    if (a.updatedAt && !isDate(a.updatedAt)) return false;
    if (activityIds.has(a.id)) return false;
    activityIds.add(a.id);
  }

  const recordIds = new Set<string>();
  for (const r of data.records) {
    if (!r.id) return false;
    if (!r.activityId || !activityIds.has(r.activityId)) return false;
    if (r.memo && r.memo.length > maxMemoLength) return false;
    if (!r.timeFrames) return false;

    if (r.timeFrames.length < 1 || r.timeFrames.length > maxTimeFrames)
      return false;
    for (const frame of r.timeFrames) {
      if (!isDate(frame.start) || !isDate(frame.end)) return false;
    }
    if (recordIds.has(r.id)) return false;

    recordIds.add(r.id);
  }

  return true;
}

function dateReceiver(key: string, value: string) {
  if (
    typeof value === 'string' &&
    /^\d{4}-[01]\d-[0-3]\dT[012]\d(?::[0-6]\d){2}\.\d{3}Z$/.test(value)
  ) {
    return new Date(value);
  }
  return value;
}

async function importJson() {
  if (!fileToImport.value) {
    $q.notify({
      type: 'negative',
      message: 'No JSON file is specified.',
    });
    return;
  }
  const text = (await readAsText(fileToImport.value)) as string;
  const data = JSON.parse(text, dateReceiver) as PortableData;
  if (!isValid(data)) {
    $q.notify({
      type: 'negative',
      message: 'JSON file format is invalid to import.',
    });
    return;
  }

  await categoryStore.importCategories(data.categories);
  await activityStore.importActivities(data.activities);
  await recordStore.importRecords(data.records);
  await cacheStore.recomputeCache();
  $q.notify({
    type: 'positive',
    message: `Successfully imported ${data.categories.length} categories, ${data.activities.length} activities, and ${data.records.length} records.`,
  });
}

function onUploadRejected() {
  $q.notify({
    type: 'negative',
    message: `File size exeeds the limit: ${uploadSizeLimit}`,
  });
}

async function exportTogglCSV(paid: boolean) {
  const email = authStore.user?.email;
  if (!email) {
    console.error('No email address to output for Toggl CSV.');
    return;
  }

  const activities = await activityStore.exportActivities();
  const categories = await categoryStore.exportCategories();
  const records = await recordStore.exportRecords();

  const idToCategory = {} as { [key: string]: PortableCategory };
  for (const category of categories) {
    idToCategory[category.id] = category;
  }
  const idToActivity = {} as { [key: string]: PortableActivity };
  for (const activity of activities) {
    idToActivity[activity.id] = activity;
  }

  let content = paid
    ? 'Email,Start Date,Start Time,Duration,Project,Task,Description\n'
    : 'Email,Start Date,Start Time,Duration,Project,Description\n';
  for (const rec of records) {
    const activity = idToActivity[rec.activityId];
    if (!activity) continue;
    let projectStr = 'Not specified';
    if (activity.categoryId && idToCategory[activity.categoryId]) {
      projectStr = idToCategory[activity.categoryId].label;
    }
    let taskStr = activity.label;
    let descriptionStr = activity.label;
    if (rec.memo) descriptionStr += ' (' + rec.memo + ')';
    for (const frame of rec.timeFrames) {
      const start = frame.start;
      const durSeconds = Math.ceil(
        (frame.end.getTime() - frame.start.getTime()) / 1000
      );
      const hour = Math.floor(durSeconds / (60 * 60));
      const minute = Math.floor((durSeconds % (60 * 60)) / 60);
      const second = durSeconds % 60;
      const startDateStr = date.formatDate(start, 'YYYY-MM-DD');
      const startTimeStr = date.formatDate(start, 'HH:mm:ss');
      const durationStr = `${hour}:${('00' + minute).slice(-2)}:${(
        '00' + second
      ).slice(-2)}`;
      if (paid) {
        content += `${email},${startDateStr},${startTimeStr},${durationStr},${projectStr},${taskStr},${descriptionStr}\n`;
      } else {
        content += `${email},${startDateStr},${startTimeStr},${durationStr},${projectStr},${descriptionStr}\n`;
      }
    }
  }
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download =
    'sumtimer-' + date.formatDate(Date.now(), 'YYYYMMDD-HHmm') + '.csv';
  link.click();
}
</script>

<template>
  <q-list>
    <q-item-label header>Export / Import</q-item-label>
    <q-item>
      <q-item-section>
        <q-item-label>Export JSON file</q-item-label>
        <q-item-label caption>
          Export all stored data as JSON file.
        </q-item-label>
      </q-item-section>
      <q-item-section side>
        <q-btn color="primary" label="Export" @click="exportJson" />
      </q-item-section>
    </q-item>
    <q-item>
      <q-item-section>
        <q-item-label>Import JSON file</q-item-label>
        <q-item-label caption>
          Import data from a JSON file, which should be exported by the above
          button.
        </q-item-label>
      </q-item-section>
      <q-item-section side>
        <q-file
          v-model="fileToImport"
          dense
          class="q-mr-md"
          :max-file-size="uploadSizeLimit"
          @rejected="onUploadRejected"
        />
      </q-item-section>
      <q-item-section side>
        <q-btn color="primary" label="Import" @click="importJson" />
      </q-item-section>
    </q-item>
    <q-item>
      <q-item-section>
        <q-item-label>Export CSV file (for Toggle free plan)</q-item-label>
        <q-item-label caption>
          Export records as Toggl-compatible CSV data. Some imcompatible data
          can be missing.
        </q-item-label>
      </q-item-section>
      <q-item-section side>
        <q-btn label="Export" @click="exportTogglCSV(false)" />
      </q-item-section>
    </q-item>
    <q-item>
      <q-item-section>
        <q-item-label>Export CSV file (for Toggle paid plan)</q-item-label>
        <q-item-label caption>
          Export records as Toggl-compatible CSV data. Some imcompatible data
          can be missing. Sumtimer activities will be exported as Toggle tasks,
          which requires paid paln.
        </q-item-label>
      </q-item-section>
      <q-item-section side>
        <q-btn label="Export" @click="exportTogglCSV(true)" />
      </q-item-section>
    </q-item>
  </q-list>
</template>
