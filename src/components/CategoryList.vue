<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useUserDataStore } from 'stores/user-data-store';
import CategoryItem from './CategoryItem.vue';

const userStore = useUserDataStore();
const { categories } = storeToRefs(userStore);
</script>

<template>
  <div class="q-pa-md col q-gutter-md">
    <CategoryItem
      v-for="category in categories"
      :key="category.id"
      :id="category.id"
      :name="category.label"
      :color="category.color"
    ></CategoryItem>
  </div>
</template>
