<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import type { CachedCategory } from '@/types/documents';
import { useAuthStore } from '@/stores/auth-store';
import { useCacheStore } from '@/stores/cache-store';
import ActivityForm from '@/components/ActivityForm.vue';
import ActivityList from '@/components/ActivityList.vue';
import CategoryTab from '@/components/CategoryTab.vue';
import CategoryForm from '@/components/CategoryForm.vue';
import CategoryItem from '@/components/CategoryItem.vue';

const route = useRoute();
const authStore = useAuthStore();
const cacheStore = useCacheStore();
const router = useRouter();

const { uid } = storeToRefs(authStore);
const { categories } = storeToRefs(cacheStore);

const creatingCategory = ref(false);
const creatingActivity = ref(false);
const editingCategory = ref(false);
const splitterModel = ref(25);
const tab = ref('');
const currentCategory = ref(undefined as CachedCategory | undefined);

const cid = computed(() => {
  if (typeof route.params.cid === 'string') return route.params.cid;
  return undefined;
});

function onEditCategory(cid: string) {
  let category = undefined;
  for (const c of categories.value) {
    if (c.id === cid) {
      category = c;
      break;
    }
  }
  currentCategory.value = category;
  editingCategory.value = true;
}

function onCategoryDeleted() {
  editingCategory.value = false;
  router.push('/activities');
}
</script>

<template>
  <div class="q-py-md q-pr-md">
    <q-splitter v-model="splitterModel">
      <template #before>
        <div>
          <q-tabs
            v-model="tab"
            vertical
            no-caps
            active-class="tab-active"
            align="justify"
          >
            <CategoryTab />
            <CategoryTab
              v-for="category in categories"
              :key="category.id"
              :cat="category"
            />
          </q-tabs>
          <q-btn
            color="grey"
            flat
            rounded
            icon="add"
            label="Add category"
            size="md"
            class="q-ma-xs"
            @click="creatingCategory = true"
          />
        </div>
      </template>
      <template #after>
        <CategoryItem
          v-if="cid"
          :cid="cid"
          class="q-pa-sm"
          @on-edit="onEditCategory"
        />
        <ActivityList v-if="uid" :uid="uid" :cid="cid" class="q-ml-sm" />
        <q-btn
          color="grey"
          flat
          rounded
          icon="add"
          label="Add activity"
          size="md"
          class="q-mx-sm q-my-xs"
          @click="creatingActivity = true"
        />
      </template>
    </q-splitter>
  </div>

  <q-dialog v-model="creatingActivity">
    <ActivityForm
      :initial-category="tab"
      @on-created="creatingActivity = false"
    />
  </q-dialog>
  <q-dialog v-model="creatingCategory">
    <CategoryForm @on-added="creatingCategory = false" />
  </q-dialog>
  <q-dialog v-model="editingCategory">
    <CategoryForm
      :cat="currentCategory"
      @on-updated="editingCategory = false"
      @on-deleted="onCategoryDeleted"
    />
  </q-dialog>
</template>
