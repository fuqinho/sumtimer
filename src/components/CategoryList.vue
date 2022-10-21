<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useCategoryStore } from 'src/stores/category-store';
import CategoryItem from 'src/components/CategoryItem.vue';

// =========================== Properties/Emitters =============================
// =========================== Use stores/composables ==========================
const categoryStore = useCategoryStore();

// =========================== Computed properties =============================
// =========================== Refs ============================================
const { categories } = storeToRefs(categoryStore);

// =========================== Methods =========================================
// =========================== Additional setup ================================
</script>

<template>
  <div class="q-pa-md col q-gutter-md">
    <CategoryItem
      v-for="category in categories"
      :key="category.id"
      :doc="category"
    ></CategoryItem>
  </div>
</template>
