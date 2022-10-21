<script setup lang="ts">
import { computed, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { ActivityDoc, ActivityChange } from 'src/common/types';
import { useActivityStore } from 'src/stores/activity-store';
import { useCategoryStore } from 'src/stores/category-store';

// =========================== Properties/Emitters =============================
interface Props {
  doc?: ActivityDoc;
}
const props = defineProps<Props>();
const emit = defineEmits(['onCreated', 'onUpdated']);

// =========================== Use stores/composables ==========================
const categoryStore = useCategoryStore();
const activityStore = useActivityStore();

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

// =========================== Refs ============================================
const { categories } = storeToRefs(categoryStore);
const selectedCategory = ref(
  null as { cid: string; label: string; color: string } | null
);
const activityName = ref('');

// =========================== Methods =========================================
async function addActivity() {
  await activityStore.addActivity(
    activityName.value,
    selectedCategory.value ? selectedCategory.value.cid : undefined
  );
  emit('onCreated');
}

async function updateActivity() {
  if (!props.doc) {
    console.error('updateActivity is called without document data.');
    return;
  }
  const change = {} as ActivityChange;
  if (
    selectedCategory.value &&
    selectedCategory.value.cid &&
    selectedCategory.value.cid !== props.doc.data.cid
  ) {
    change.cid = selectedCategory.value.cid;
  }
  if (activityName.value !== props.doc.data.label) {
    change.label = activityName.value;
  }
  await activityStore.updateActivity(props.doc.id, change);
  emit('onUpdated');
}

// =========================== Additional setup ================================
if (props.doc) {
  const data = activityStore.getActivityData(props.doc.id);
  if (data) {
    for (const option of categoryOptions.value) {
      if (option.cid == data.cid) {
        selectedCategory.value = option;
      }
    }
    activityName.value = data.label;
  }
}
</script>

<template>
  <q-card>
    <q-card-section v-if="!!props.doc">Modify activity</q-card-section>
    <q-card-section v-else>Create activity</q-card-section>
    <q-separator />
    <q-card-section>
      <q-select
        label="Category"
        :options="categoryOptions"
        v-model="selectedCategory"
      >
        <template v-slot:option="scope">
          <q-item v-bind="scope.itemProps" :style="{ color: scope.opt.color }">
            {{ scope.opt.label }}
          </q-item>
        </template>
        <template v-slot:selected-item="scope">
          <span :style="{ color: scope.opt.color }">{{ scope.opt.label }}</span>
        </template>
      </q-select>
      <q-input label="Activity name" v-model="activityName"> </q-input>
    </q-card-section>
    <q-card-actions align="right">
      <q-btn label="Cancel" flat v-close-popup></q-btn>
      <q-btn
        v-if="!!props.doc"
        label="Save"
        color="primary"
        @click="updateActivity"
      ></q-btn>
      <q-btn v-else label="Add" color="primary" @click="addActivity"></q-btn>
    </q-card-actions>
  </q-card>
</template>
