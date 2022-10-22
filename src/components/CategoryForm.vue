<script setup lang="ts">
import { ref } from 'vue';
import { UpdateData } from '@firebase/firestore';
import { CategoryDocumentData, CategoryDoc } from 'src/common/types';
import {
  defaultColorPalette,
  defaultCategoryColor,
} from 'src/common/constants';
import { useCategoryStore } from 'src/stores/category-store';

// =========================== Properties/Emitters =============================
interface Props {
  doc?: CategoryDoc;
}
const props = defineProps<Props>();
const emit = defineEmits(['onAdded', 'onUpdated', 'onDeleted']);

// =========================== Use stores/composables ==========================
const categoryStore = useCategoryStore();

// =========================== Computed properties =============================
// =========================== Refs ============================================
const name = ref(props.doc ? props.doc.data.label : '');
const color = ref(props.doc ? props.doc.data.color : defaultCategoryColor);

// =========================== Methods =========================================
async function add() {
  await categoryStore.addCategory(name.value, color.value);
  emit('onAdded');
}

async function update() {
  if (!props.doc) {
    console.error('CategoryForm.update is called without base document data.');
    return;
  }
  const change = {} as UpdateData<CategoryDocumentData>;
  change.label = name.value;
  change.color = color.value;
  await categoryStore.updateCategory(props.doc.id, change);
  emit('onUpdated');
}

async function deleteCategory() {
  if (!props.doc) {
    console.error('CategoryForm.delete is called without base document data.');
    return;
  }
  await categoryStore.deleteCategory(props.doc.id);
  emit('onDeleted');
}
// =========================== Additional setup ================================
</script>

<template>
  <q-card>
    <q-card-section v-if="props.doc">Modify category</q-card-section>
    <q-card-section v-else>Create category</q-card-section>
    <q-separator />
    <q-card-section>
      <q-input v-model="name" filled label="Category name" />
      <q-input v-model="color" filled>
        <template v-slot:append>
          <q-icon name="colorize" class="cursor-pointer">
            <q-popup-proxy
              cover
              transition-show="scale"
              transition-hide="scale"
            >
              <q-color
                v-model="color"
                no-header
                default-view="palette"
                class="cpicker"
                :palette="defaultColorPalette"
              />
            </q-popup-proxy>
          </q-icon>
        </template>
      </q-input>
      <q-avatar :style="{ 'background-color': color }" />
    </q-card-section>
    <q-card-actions>
      <q-btn
        v-if="props.doc"
        flat
        round
        icon="delete"
        color="negative"
        @click="deleteCategory"
      />
      <q-space />
      <q-btn label="Cancel" flat v-close-popup></q-btn>
      <q-btn label="Save" v-if="props.doc" color="primary" @click="update" />
      <q-btn label="Add" v-else color="primary" @click="add" />
    </q-card-actions>
  </q-card>
</template>

<style lang="scss">
.cpicker {
  max-width: 300px;
}
</style>
