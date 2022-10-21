<script setup lang="ts">
import { computed, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useActivityStore } from 'src/stores/activity-store';
import { useUserDataStore } from 'src/stores/user-data-store';

// ======= Properties/Emitters =======
interface Props {
  activityId?: string;
}
const props = defineProps<Props>();
const emit = defineEmits(['onCreated', 'onUpdated']);

// ======= Use stores/composables =======
const userStore = useUserDataStore();
const activityStore = useActivityStore();

// ======= Refs =======
const { categories } = storeToRefs(userStore);
const selectedCategory = ref(
  null as { cid: string; label: string; color: string } | null
);
const activityName = ref('');

// ======= Computed properties =======
const categoryOptions = computed(() => {
  return categories.value.map((category) => {
    return {
      cid: category.id,
      label: category.label,
      color: category.color,
    };
  });
});

// ======= Other setup =======
if (props.activityId) {
  const data = activityStore.getActivityData(props.activityId);
  if (data) {
    for (const option of categoryOptions.value) {
      if (option.cid == data.cid) {
        selectedCategory.value = option;
      }
    }
    activityName.value = data.label;
  }
}

// ======= Methods =======
async function addActivity() {
  await activityStore.addActivity(
    activityName.value,
    selectedCategory.value ? selectedCategory.value.cid : undefined
  );
  emit('onCreated');
}

async function updateActivity() {
  console.log('updateActivity');
  if (!props.activityId) {
    console.error('updateActivity is called without activityId.');
    return;
  }
  const data = activityStore.getActivityData(props.activityId);
  if (!data) {
    console.error('updateActivity is called without activityData.');
    return;
  }
  if (selectedCategory.value) data.cid = selectedCategory.value.cid;
  data.label = activityName.value;

  await activityStore.updateActivity(props.activityId, data);
  emit('onUpdated');
}
</script>

<template>
  <q-card>
    <q-card-section v-if="!!props.activityId">Modify activity</q-card-section>
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
        v-if="!!props.activityId"
        label="Save"
        color="primary"
        @click="updateActivity"
      ></q-btn>
      <q-btn v-else label="Add" color="primary" @click="addActivity"></q-btn>
    </q-card-actions>
  </q-card>
</template>
