<script setup lang="ts">
import FocusModeSettings from '@/components/FocusModeSettings.vue';
import ImportExport from '@/components/ImportExport.vue';
import DangerSettings from '@/components/DangerSettings.vue';
import UserPreference from '@/components/UserPreference.vue';
</script>

<template>
  <q-page class="q-pa-lg q-gutter-lg">
    <div>{{ $t('success') }}</div>
    <q-card>
      <UserPreference class="q-pb-sm" />
    </q-card>
    <q-card>
      <FocusModeSettings />
    </q-card>
    <q-card class="q-pb-sm">
      <ImportExport />
    </q-card>
    <q-card class="q-pb-sm">
      <DangerSettings />
    </q-card>
  </q-page>
</template>
