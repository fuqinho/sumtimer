<script setup lang="ts">
import { computed, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useActivityStore } from 'src/stores/activity-store';
import { useUserDataStore } from 'src/stores/user-data-store';

const emit = defineEmits(['onCreated']);

const userStore = useUserDataStore();
const { categories } = storeToRefs(userStore);
const activityStore = useActivityStore();

const categoryOptions = computed(() => {
  return categories.value.map((category) => {
    return {
      cid: category.id,
      label: category.label,
      color: category.color,
    };
  });
});

const selectedCategory = ref(
  null as { cid: string; label: string; color: string } | null
);

const activityName = ref('');

async function addActivity() {
  await activityStore.addActivity(
    activityName.value,
    selectedCategory.value ? selectedCategory.value.cid : undefined
  );
  emit('onCreated');
}
</script>

<template>
  <q-card>
    <q-card-section>New activity.</q-card-section>
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
      <q-btn label="Add" color="primary" @click="addActivity"></q-btn>
    </q-card-actions>
  </q-card>
</template>
