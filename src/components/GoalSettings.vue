<script setup lang="ts">
import { useUtil } from '@/composables/util';
import { useCacheStore } from '@/stores/cache-store';
import { useCategoryStore } from '@/stores/category-store';
import { storeToRefs } from 'pinia';
import { ref, watch } from 'vue';

const cacheStore = useCacheStore();
const categoryStore = useCategoryStore();
const { lcl } = useUtil();

const { categories } = storeToRefs(cacheStore);

const goals = ref({} as { [key: string]: number });

function updateModelValues() {
  for (const cat of categories.value) {
    goals.value[cat.id] = cat.data.weekGoal || 0;
  }
}

updateModelValues();
watch(categories, updateModelValues);
</script>

<template>
  <q-list>
    <q-item-label header>Weekly targets (hours / week)</q-item-label>
    <q-item v-for="cat in categories" :key="cat.id">
      <q-item-section side>
        <q-icon name="folder" :style="{ color: cat.data.color }" />
      </q-item-section>
      <q-item-section side class="cat-label">
        {{ lcl(cat.data.label) }}
      </q-item-section>
      <q-item-section side class="goal-label text-body1">
        {{ cat.data.weekGoal ? cat.data.weekGoal : '' }}
      </q-item-section>
      <q-item-section>
        <q-slider
          :model-value="goals[cat.id]"
          :step="1"
          :min="0"
          :max="50"
          label
          @change="
            (val: number) =>
              categoryStore.updateCategory(cat.id, { weekGoal: val })
          "
        />
      </q-item-section>
    </q-item>
  </q-list>
</template>

<style scoped>
.cat-label {
  width: 18%;
}

.goal-label {
  width: 36px;
  align-items: flex-end;
}
</style>
