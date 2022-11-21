<script setup lang="ts">
import { useCacheStore } from '@/stores/cache-store';
import { storeToRefs } from 'pinia';
import { computed } from 'vue';

const props = defineProps<{
  cid: string;
}>();
const emit = defineEmits<{
  (e: 'onEdit', cid: string): void;
}>();

const cacheStore = useCacheStore();
const { idToCategory } = storeToRefs(cacheStore);

const category = computed(() => idToCategory.value[props.cid]);
</script>

<template>
  <div class="row q-py-sm q-px-md">
    <div class="text-h6" :style="{ color: category.color }">
      {{ category.label }}
    </div>
    <q-btn
      icon="edit"
      flat
      round
      size="sm"
      color="grey"
      @click.prevent="emit('onEdit', props.cid)"
    ></q-btn>
  </div>
</template>
