<script setup lang="ts">
import { useUserDataStore } from 'stores/user-data-store';

interface Props {
  id: string;
  name: string;
  color?: string;
}

const props = defineProps<Props>();

const userStore = useUserDataStore();
const { removeCategory } = userStore;
</script>

<template>
  <q-card class="category-card">
    <q-card-section
      :style="{
        color: '#ffffff',
        'background-color': props.color || '#ededed',
      }"
    >
      <div class="text-h6">{{ props.name }}</div>
    </q-card-section>
    <q-separator />
    <q-card-actions align="right">
      <q-btn flat>Edit</q-btn>
      <q-btn @click="removeCategory(props.id)" flat>Delete</q-btn>
    </q-card-actions>
  </q-card>
</template>

<style lang="scss" scoped>
.category-card {
  max-width: 350px;
}
</style>
