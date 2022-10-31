<script setup lang="ts">
import { computed, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { ActivityChange, CachedActivity } from 'src/types/documents';
import { useActivityStore } from 'src/stores/activity-store';
import { useCacheStore } from 'src/stores/cache-store';

// =========================== Properties/Emitters =============================
interface Props {
  act?: CachedActivity;
  initialCategory?: string;
}
const props = defineProps<Props>();
const emit = defineEmits(['onCreated', 'onUpdated']);

// =========================== Use stores/composables ==========================
const activityStore = useActivityStore();
const cacheStore = useCacheStore();

// =========================== Refs ============================================
const { categories, idToCategory, idToActivity } = storeToRefs(cacheStore);
const selectedCategory = ref(
  null as { cid: string; label: string; color: string } | null
);
const activityName = ref('');

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
  if (!selectedCategory.value) return;
  await activityStore.addActivity(
    activityName.value,
    selectedCategory.value.cid
  );
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
  if (activityName.value !== props.act.data.label) {
    change.label = activityName.value;
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
    activityName.value = data.label;
  }
} else if (props.initialCategory) {
  for (const option of categoryOptions.value) {
    if (option.cid == props.initialCategory) {
      selectedCategory.value = option;
    }
  }
  activityName.value = idToCategory.value[props.initialCategory].label;
}
</script>

<template>
  <q-card>
    <q-card-section v-if="!!props.act">Modify activity</q-card-section>
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
        v-if="!!props.act"
        label="Save"
        color="primary"
        @click="updateActivity"
      ></q-btn>
      <q-btn v-else label="Add" color="primary" @click="addActivity"></q-btn>
    </q-card-actions>
  </q-card>
</template>
