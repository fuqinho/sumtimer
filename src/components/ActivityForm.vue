<script setup lang="ts">
import { computed, ref } from 'vue';
import { storeToRefs } from 'pinia';
import type { ActivityChange, CachedActivity } from '@/types/documents';
import { useActivityStore } from '@/stores/activity-store';
import { useCacheStore } from '@/stores/cache-store';
import { useQuasar, type QInput, type QSelect } from 'quasar';
import { useUtil } from '@/composables/util';

// =========================== Properties/Emitters =============================
const props = defineProps<{
  act?: CachedActivity;
  initialCategory?: string;
}>();
const emit = defineEmits(['onCreated', 'onUpdated']);

// =========================== Use stores/composables ==========================
const activityStore = useActivityStore();
const cacheStore = useCacheStore();
const $q = useQuasar();
const { lcl } = useUtil();

// =========================== Refs ============================================
const { categories, idToActivity } = storeToRefs(cacheStore);
const selectedCategory = ref(
  null as { cid: string; label: string; color: string } | null
);
const categoryRef = ref(null as QSelect | null);
const name = ref('');
const nameRef = ref(null as QInput | null);

// =========================== Computed properties =============================
const categoryOptions = computed(() => {
  return categories.value.map((category) => {
    return {
      cid: category.id,
      label: category.data.label,
      color: category.data.color,
    };
  });
});

// =========================== Methods =========================================
async function addActivity() {
  nameRef.value?.validate();
  categoryRef.value?.validate();
  if (
    nameRef.value?.hasError ||
    categoryRef.value?.hasError ||
    !name.value ||
    !selectedCategory.value
  ) {
    $q.notify({
      type: 'negative',
      message: 'Form has error(s).',
    });
    return;
  }
  await activityStore.addActivity(name.value, selectedCategory.value.cid);
  emit('onCreated');
}

async function updateActivity() {
  if (!props.act) {
    console.error('updateActivity is called without document data.');
    return;
  }
  const change = {} as ActivityChange;
  if (
    selectedCategory.value &&
    selectedCategory.value.cid &&
    selectedCategory.value.cid !== props.act.data.cid
  ) {
    change.cid = selectedCategory.value.cid;
  }
  if (name.value !== props.act.data.label) {
    change.label = name.value;
  }
  await activityStore.updateActivity(props.act.id, change);
  emit('onUpdated');
}

// =========================== Additional setup ================================
if (props.act) {
  const data = idToActivity.value[props.act.id];
  if (data) {
    for (const option of categoryOptions.value) {
      if (option.cid == data.cid) {
        selectedCategory.value = option;
      }
    }
    name.value = lcl(data.label);
  }
} else if (props.initialCategory) {
  for (const option of categoryOptions.value) {
    if (option.cid == props.initialCategory) {
      selectedCategory.value = option;
    }
  }
}
</script>

<template>
  <q-card :style="{ width: '80%', maxWidth: '400px' }">
    <q-card-section v-if="!!props.act">{{
      $t('modifyActivity')
    }}</q-card-section>
    <q-card-section v-else>{{ $t('createActivity') }}</q-card-section>
    <q-separator />
    <q-card-section class="q-pb-none">
      <q-select
        ref="categoryRef"
        v-model="selectedCategory"
        dense
        :label="$t('category')"
        :options="categoryOptions"
        :rules="[(v) => !!v || 'Category is required.']"
      >
        <template #option="scope">
          <q-item v-bind="scope.itemProps" :style="{ color: scope.opt.color }">
            <q-item-section avatar>
              <q-icon name="folder" />
            </q-item-section>
            <q-item-section class="category-name">
              {{ lcl(scope.opt.label) }}
            </q-item-section>
          </q-item>
        </template>
        <template #selected-item="scope">
          <div class="row items-center">
            <q-icon
              size="22px"
              name="folder"
              class="q-py-sm"
              :style="{ color: scope.opt.color }"
            />
            <span class="q-pl-sm" :style="{ color: scope.opt.color }">
              {{ lcl(scope.opt.label) }}
            </span>
          </div>
        </template>
      </q-select>
    </q-card-section>
    <q-card-section class="q-pt-none">
      <q-input
        ref="nameRef"
        v-model="name"
        :label="$t('activityName') + ' *'"
        :rules="[(v) => !!v || $t('msgActivityNameRequired')]"
        autofocus
        clearable
      >
      </q-input>
    </q-card-section>
    <q-card-actions align="right">
      <q-btn v-close-popup :label="$t('cancelBtn')" flat></q-btn>
      <q-btn
        v-if="!!props.act"
        :label="$t('saveBtn')"
        color="primary"
        @click="updateActivity"
      ></q-btn>
      <q-btn
        v-else
        :label="$t('addBtn')"
        color="primary"
        @click="addActivity"
      ></q-btn>
    </q-card-actions>
  </q-card>
</template>
