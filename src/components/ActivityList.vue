<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useActivityStore } from 'src/stores/activity-store';
import ActivityItem from 'src/components/ActivityItem.vue';
import { useRoute } from 'vue-router';
import { computed } from 'vue';

// =========================== Properties/Emitters =============================
// =========================== Use stores/composables ==========================
const activityStore = useActivityStore();
const route = useRoute();

// =========================== Computed properties =============================
const filteredActivities = computed(() => {
  if (route.params.cid) {
    return activities.value.filter((a) => a.data.cid === route.params.cid);
  } else {
    return activities.value;
  }
});

// =========================== Refs ============================================
const { activities } = storeToRefs(activityStore);

// =========================== Methods =========================================
// =========================== Additional setup ================================
</script>

<template>
  <div>
    <q-list bordered separator>
      <ActivityItem
        v-for="activity in filteredActivities"
        :key="activity.id"
        :doc="activity"
      ></ActivityItem>
    </q-list>
  </div>
</template>
