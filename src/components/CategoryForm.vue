<script setup lang="ts">
import { ref } from 'vue';
import { QInput, useQuasar } from 'quasar';
import type { CachedCategory } from '@/types/documents';
import { defaultCategoryColor } from '@/common/constants';
import {
  useCategoryStore,
  DeleteCategoryResult,
} from '@/stores/category-store';
import ColorPalette from '@/components/ColorPalette.vue';
import { useUtil } from '@/composables/util';

// =========================== Properties/Emitters =============================
const props = defineProps<{
  cat?: CachedCategory;
}>();
const emit = defineEmits(['onAdded', 'onUpdated', 'onDeleted']);

// =========================== Use stores/composables ==========================
const categoryStore = useCategoryStore();
const $q = useQuasar();
const { lcl } = useUtil();

// =========================== Refs ============================================
const name = ref(props.cat ? lcl(props.cat.data.label) : '');
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
  const result = await categoryStore.deleteCategory(props.cat.id);
  if (result == DeleteCategoryResult.ErrorHasRecords) {
    $q.notify({
      type: 'negative',
      message:
        'There are activities/records in this category. Delete them or move them out before deleting this.',
    });
    return;
  }
  emit('onDeleted');
}
// =========================== Additional setup ================================
</script>

<template>
  <q-card>
    <q-card-section v-if="props.cat">{{ $t('modifyCategory') }}</q-card-section>
    <q-card-section v-else>{{ $t('createCategory') }}</q-card-section>
    <q-separator />
    <q-card-section class="row items-start">
      <q-input
        ref="nameRef"
        v-model="name"
        :label="$t('categoryName') + ' *'"
        :rules="[(v) => !!v || $t('msgCategoryNameRequired')]"
        clearable
        class="cat-name"
      >
        <template #prepend>
          <q-icon name="folder" :style="{ color: color }" class="q-mr-sm" />
        </template>
      </q-input>
    </q-card-section>
    <q-card-section class="q-pt-none">
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
      <q-btn v-close-popup :label="$t('cancelBtn')" flat></q-btn>
      <q-btn
        v-if="props.cat"
        :label="$t('saveBtn')"
        color="primary"
        @click="update"
      />
      <q-btn v-else :label="$t('addBtn')" color="primary" @click="add" />
    </q-card-actions>
  </q-card>
</template>

<style lang="scss" scoped></style>
