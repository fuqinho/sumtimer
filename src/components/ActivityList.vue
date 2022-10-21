<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useActivityStore } from 'src/stores/activity-store';
import ActivityItem from 'src/components/ActivityItem.vue';

const activityStore = useActivityStore();
const { activities } = storeToRefs(activityStore);
</script>

<template>
  <div class="q-pa-md">
    <q-list bordered separator>
      <ActivityItem
        v-for="activity in activities"
        :key="activity.id"
        :doc="activity"
      ></ActivityItem>
    </q-list>
  </div>
</template>
