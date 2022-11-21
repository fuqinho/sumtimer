<script setup lang="ts">
import { ref } from 'vue';
import { QInput } from 'quasar';
import type { CachedCategory } from '@/types/documents';
import { defaultCategoryColor } from '@/common/constants';
import { useCategoryStore } from '@/stores/category-store';
import ColorPalette from '@/components/ColorPalette.vue';

// =========================== Properties/Emitters =============================
const props = defineProps<{
  cat?: CachedCategory;
}>();
const emit = defineEmits(['onAdded', 'onUpdated', 'onDeleted']);

// =========================== Use stores/composables ==========================
const categoryStore = useCategoryStore();

// =========================== Refs ============================================
const name = ref(props.cat ? props.cat.data.label : '');
const nameRef = ref(null as QInput | null);
const color = ref(props.cat ? props.cat.data.color : defaultCategoryColor);

// =========================== Computed properties =============================

// =========================== Methods =========================================
async function add() {
  if (nameRef.value) nameRef.value.validate();
  if (nameRef.value?.hasError) return;
  await categoryStore.addCategory(name.value, color.value);
  emit('onAdded');
}

async function update() {
  nameRef.value?.validate();
  if (nameRef.value?.hasError) return;
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
    <q-card-section class="row items-start">
      <q-input
        ref="nameRef"
        v-model="name"
        label="Category name *"
        :rules="[(v) => !!v || 'Category name is required']"
        clearable
        class="cat-name"
      >
        <template #prepend>
          <q-icon name="folder" :style="{ color: color }" class="q-mr-sm" />
        </template>
      </q-input>
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
      <q-btn v-close-popup label="Cancel" flat></q-btn>
      <q-btn v-if="props.cat" label="Save" color="primary" @click="update" />
      <q-btn v-else label="Add" color="primary" @click="add" />
    </q-card-actions>
  </q-card>
</template>

<style lang="scss" scoped></style>
