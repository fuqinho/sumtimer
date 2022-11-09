<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '@/stores/auth-store';
import RecordList from '@/components/RecordList.vue';

const route = useRoute();
const authStore = useAuthStore();
const { uid } = storeToRefs(authStore);

const aid = computed(() => {
  if (typeof route.params.aid === 'string') return route.params.aid;
  return undefined;
});
</script>

<template>
  <div class="q-pa-md">
    <RecordList v-if="uid" :uid="uid" :aid="aid" />
  </div>
</template>
