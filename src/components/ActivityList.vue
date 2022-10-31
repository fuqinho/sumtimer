<script setup lang="ts">
import ActivityItem from 'src/components/ActivityItem.vue';
import { computed } from 'vue';
import { useCacheStore } from 'src/stores/cache-store';
import { storeToRefs } from 'pinia';

// =========================== Properties/Emitters =============================
interface Props {
  uid: string;
  cid?: string;
}
const props = defineProps<Props>();

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
