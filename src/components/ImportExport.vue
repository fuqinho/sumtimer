<script setup lang="ts">
import { PortableData } from 'src/common/types';
import { maxMemoLength, maxTimeFrames } from 'src/common/constants';
import { date, useQuasar } from 'quasar';
import { useActivityStore } from 'src/stores/activity-store';
import { useCategoryStore } from 'src/stores/category-store';
import { useRecordStore } from 'src/stores/record-store';
import { ref } from 'vue';

const categoryStore = useCategoryStore();
const activityStore = useActivityStore();
const recordStore = useRecordStore();
const $q = useQuasar();

const currentVersion = 1;
const uploadSizeLimit = 2 * 1024 * 1024;

const fileToImport = ref(null);

async function exportJson() {
  console.log('exportJson called.');

  const activities = await activityStore.exportActivities();
  const categories = await categoryStore.exportCategories();
  const records = await recordStore.exportRecords();

  const exportData: PortableData = {
    version: currentVersion,
    categories: categories,
    activities: activities,
    records: records,
  };

  console.log(exportData);
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
  console.log('importJson called.');
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
</script>

<template>
  <div class="q-pa-md column items-start">
    <q-btn @click="exportJson" class="q-my-md" label="Export as JSON file" />
    <q-file
      style="max-width: 300px"
      v-model="fileToImport"
      :max-file-size="uploadSizeLimit"
      @rejected="onUploadRejected"
    />
    <q-btn @click="importJson" class="q-my-md" label="Impont JSON file" />
  </div>
</template>
