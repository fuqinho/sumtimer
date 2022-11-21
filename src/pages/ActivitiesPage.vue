<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
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

function onEditCategoryClicked(cid: string) {
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
              @on-edit="onEditCategoryClicked"
            />
          </q-tabs>
          <q-btn
            color="grey"
            outline
            rounded
            icon="add"
            label="Add category"
            size="md"
            style="margin: 12px 8px"
            @click="creatingCategory = true"
          />
        </div>
      </template>
      <template #after>
        <CategoryItem v-if="cid" :cid="cid" @on-edit="onEditCategoryClicked" />
        <ActivityList v-if="uid" :uid="uid" :cid="cid" />
        <q-btn
          color="grey"
          outline
          rounded
          icon="add"
          label="Add activity"
          size="md"
          style="margin: 0 16px"
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
      @on-deleted="editingCategory = false"
    />
  </q-dialog>
</template>
