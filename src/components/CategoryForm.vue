<script setup lang="ts">
import { ref } from 'vue';
import { CachedCategory } from 'src/types/documents';
import {
  defaultCategoryColor,
  defaultCategoryName,
} from 'src/common/constants';
import { useCategoryStore } from 'src/stores/category-store';
import ColorPalette from 'src/components/ColorPalette.vue';

// =========================== Properties/Emitters =============================
interface Props {
  cat?: CachedCategory;
}
const props = defineProps<Props>();
const emit = defineEmits(['onAdded', 'onUpdated', 'onDeleted']);

// =========================== Use stores/composables ==========================
const categoryStore = useCategoryStore();

// =========================== Refs ============================================
const name = ref(props.cat ? props.cat.data.label : defaultCategoryName);
const color = ref(props.cat ? props.cat.data.color : defaultCategoryColor);

// =========================== Computed properties =============================

// =========================== Methods =========================================
async function add() {
  await categoryStore.addCategory(name.value, color.value);
  emit('onAdded');
}

async function update() {
  if (!props.cat) {
    console.error('CategoryForm.update is called without base document data.');
    return;
  }
  const newData = { ...props.cat.data };
  newData.label = name.value;
  newData.color = color.value;
  await categoryStore.updateCategory(props.cat.id, newData);
  emit('onUpdated');
}

async function deleteCategory() {
  if (!props.cat) {
    console.error('CategoryForm.delete is called without base document data.');
    return;
  }
  await categoryStore.deleteCategory(props.cat.id);
  emit('onDeleted');
}
// =========================== Additional setup ================================
</script>

<template>
  <q-card>
    <q-card-section v-if="props.cat">Modify category</q-card-section>
    <q-card-section v-else>Create category</q-card-section>
    <q-separator />
    <q-card-section class="row items-center">
      <q-icon
        name="folder"
        size="md"
        :style="{ color: color }"
        class="q-mr-sm"
      />
      <q-input dense v-model="name" class="cat-name" />
    </q-card-section>
    <q-card-section>
      <ColorPalette v-model="color" />
    </q-card-section>
    <q-card-actions>
      <q-btn
        v-if="props.cat"
        flat
        round
        icon="delete"
        color="negative"
        @click="deleteCategory"
      />
      <q-space />
      <q-btn label="Cancel" flat v-close-popup></q-btn>
      <q-btn label="Save" v-if="props.cat" color="primary" @click="update" />
      <q-btn label="Add" v-else color="primary" @click="add" />
    </q-card-actions>
  </q-card>
</template>

<style lang="scss" scoped>
.cat-name {
  font-size: 18px;
}
</style>
