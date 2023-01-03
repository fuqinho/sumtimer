<script setup lang="ts">
import FocusModeSettings from '@/components/FocusModeSettings.vue';
import ImportExport from '@/components/ImportExport.vue';
</script>

<template>
  <q-page class="q-pa-lg q-gutter-lg">
    <q-card>
      <FocusModeSettings />
    </q-card>
    <q-card>
      <ImportExport />
    </q-card>
  </q-page>
</template>
