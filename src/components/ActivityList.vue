<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useActivityStore } from 'stores/activity-store';
import ActivityItem from './ActivityItem.vue';

const activityStore = useActivityStore();
const { activities } = storeToRefs(activityStore);
</script>

<template>
  <div class="q-pa-md">
    <div class="col">
      <ActivityItem
        v-for="activity in activities"
        :key="activity.id"
        :activity_id="activity.id"
        :activity_data="activity.data"
      ></ActivityItem>
    </div>
  </div>
</template>
