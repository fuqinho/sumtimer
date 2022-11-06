<script setup lang="ts">
import { useQuasar } from 'quasar';
import ImportExport from 'src/components/ImportExport.vue';

const $q = useQuasar();

function deleteAccount() {
  $q.notify({
    type: 'negative',
    message: 'This function has not been implemented yet.',
  });
}
</script>

<template>
  <q-card class="container">
    <q-card-section>
      <q-card-section>
        <div class="text-h6">General</div>
      </q-card-section>
    </q-card-section>
    <q-card-section>
      <q-card-section>
        <div class="text-h6">Export / Import</div>
      </q-card-section>
      <ImportExport />
    </q-card-section>
    <q-card-section>
      <q-card-section class="text-h6">Delete account</q-card-section>
      <q-card-section class="q-py-none">
        This will immediately delete all your data including records,
        activities, etc...
      </q-card-section>
      <q-card-section>
        <q-btn color="negative" @click="deleteAccount"> Delete </q-btn>
      </q-card-section>
    </q-card-section>
  </q-card>
</template>

<style scoped>
.container {
  width: 100%;
}
</style>
