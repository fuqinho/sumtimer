<script setup lang="ts">
import { useRoute } from 'vue-router';
import RecordList from 'src/components/RecordList.vue';
import { computed } from 'vue';
import { useAuthStore } from 'src/stores/auth-store';
import { storeToRefs } from 'pinia';

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
