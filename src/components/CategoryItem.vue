<script setup lang="ts">
import { useUtil } from '@/composables/util';
import { useCacheStore } from '@/stores/cache-store';
import { storeToRefs } from 'pinia';
import { computed } from 'vue';

const props = defineProps<{
  cid: string;
}>();
const emit = defineEmits<{
  (e: 'onEdit', cid: string): void;
}>();

const { lcl } = useUtil();
const cacheStore = useCacheStore();
const { idToCategory } = storeToRefs(cacheStore);

const category = computed(() => idToCategory.value[props.cid]);
</script>

<template>
  <div class="row">
    <div v-if="category" class="text-h6" :style="{ color: category.color }">
      {{ lcl(category.label) }}
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
