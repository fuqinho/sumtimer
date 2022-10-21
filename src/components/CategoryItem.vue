<script setup lang="ts">
import { CategoryDoc } from 'src/common/types';
import { useCategoryStore } from 'src/stores/category-store';
import { ref } from 'vue';
import CategoryForm from './CategoryForm.vue';

interface Props {
  doc: CategoryDoc;
}
const props = defineProps<Props>();

const editing = ref(false);

const categoryStore = useCategoryStore();
</script>

<template>
  <q-card class="category-card">
    <q-card-section
      :style="{
        color: '#ffffff',
        'background-color': props.doc.data.color,
      }"
    >
      <div class="text-h6">{{ props.doc.data.label }}</div>
    </q-card-section>
    <q-separator />
    <q-card-actions align="right" class="text-grey-8">
      <q-btn @click="editing = true" flat round icon="edit" />
      <q-btn
        @click="categoryStore.deleteCategory(props.doc.id)"
        round
        flat
        icon="delete"
      />
    </q-card-actions>
  </q-card>

  <q-dialog v-model="editing">
    <CategoryForm :doc="props.doc" @on-updated="editing = false"></CategoryForm
    >>
  </q-dialog>
</template>

<style lang="scss" scoped>
.category-card {
  max-width: 350px;
}
</style>
