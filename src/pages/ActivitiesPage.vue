<script setup lang="ts">
import ActivityForm from 'src/components/ActivityForm.vue';
import ActivityList from 'src/components/ActivityList.vue';
import { ref } from 'vue';

const creating = ref(false);
</script>

<template>
  <q-btn class="q-ma-md" @click="creating = true">Add new category.</q-btn>
  <ActivityList />
  <q-dialog v-model="creating">
    <ActivityForm @on-created="creating = false" />
  </q-dialog>
</template>
