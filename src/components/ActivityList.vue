<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useCacheStore } from '@/stores/cache-store';
import ActivityItem from '@/components/ActivityItem.vue';

// =========================== Properties/Emitters =============================
const props = defineProps<{
  uid: string;
  cid?: string;
}>();

// =========================== Use stores/composables ==========================
const cacheStore = useCacheStore();

// =========================== Refs ============================================
const { activities } = storeToRefs(cacheStore);

// =========================== Computed properties =============================
const cid = computed(() => props.cid);
const filteredActivities = computed(() => {
  if (cid.value) {
    return activities.value.filter((item) => item.data.cid === cid.value);
  } else {
    return activities.value;
  }
});

// =========================== Methods =========================================
// =========================== Additional setup ================================
</script>

<template>
  <div>
    <q-list bordered separator>
      <ActivityItem
        v-for="activity in filteredActivities"
        :key="activity.id"
        :act="activity"
      ></ActivityItem>
    </q-list>
  </div>
</template>
