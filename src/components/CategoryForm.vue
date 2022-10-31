<script setup lang="ts">
import { ref } from 'vue';
import { CachedCategory } from 'src/types/documents';
import {
  defaultColorPalette,
  defaultCategoryColor,
} from 'src/common/constants';
import { useCategoryStore } from 'src/stores/category-store';

// =========================== Properties/Emitters =============================
interface Props {
  cat?: CachedCategory;
}
const props = defineProps<Props>();
const emit = defineEmits(['onAdded', 'onUpdated', 'onDeleted']);

// =========================== Use stores/composables ==========================
const categoryStore = useCategoryStore();

// =========================== Computed properties =============================
// =========================== Refs ============================================
const name = ref(props.cat ? props.cat.data.label : '');
const color = ref(props.cat ? props.cat.data.color : defaultCategoryColor);

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

<style lang="scss">
.cpicker {
  max-width: 300px;
}
</style>
