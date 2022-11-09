<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useCacheStore } from '@/stores/cache-store';

const props = defineProps<{
  aid: string;
}>();
interface Emits {
  (e: 'onSelect', aid: string): void;
}
const emit = defineEmits<Emits>();

const cacheStore = useCacheStore();

const { idToCategory, activities } = storeToRefs(cacheStore);
const acts = computed(() => {
  return activities.value.map((a) => {
    return {
      id: a.id,
      label: a.data.label,
      catLabel: idToCategory.value[a.data.cid].label,
      catColor: idToCategory.value[a.data.cid].color,
      selected: a.id === props.aid,
    };
  });
});
</script>

<template>
  <q-card class="container">
    <q-scroll-area class="scroll-area">
      <q-list separator>
        <q-item v-for="act in acts" :key="act.id" class="activity" dense>
          <div
            class="color-label"
            :style="{
              'background-color': act.catColor,
            }"
          ></div>
          <q-item-section v-close-popup @click="emit('onSelect', act.id)">
            <q-item-label caption :style="{ color: act.catColor }">{{
              act.catLabel
            }}</q-item-label>
            <q-item-label class="activity-name ellipsis">
              {{ act.label }}
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-scroll-area>
  </q-card>
</template>

<style scoped>
.container {
  height: 80%;
  width: 100%;
  background-color: white;
}

.scroll-area {
  width: 100%;
  height: 100%;
}

.activity {
  padding: 0 !important;
  cursor: pointer;
}

.color-label {
  width: 8px;
  height: 42px;
  margin-right: 8px;
}

.activity-name {
  font-size: 16px;
  margin-top: 0 !important;
}
</style>
