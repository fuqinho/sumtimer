<script setup lang="ts">
import ActivityForm from 'src/components/ActivityForm.vue';
import ActivityList from 'src/components/ActivityList.vue';
import CategoryTab from 'src/components/CategoryTab.vue';
import { ref } from 'vue';
import { useCategoryStore } from 'src/stores/category-store';
import { storeToRefs } from 'pinia';
import CategoryForm from 'src/components/CategoryForm.vue';
import { CategoryDoc } from 'src/common/types';

const categoryStore = useCategoryStore();

const { categories } = storeToRefs(categoryStore);

const creatingCategory = ref(false);
const creatingActivity = ref(false);
const editingCategory = ref(false);
const splitterModel = ref(20);
const tab = ref('');
const currentCategory = ref(undefined as CategoryDoc | undefined);

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
      <template v-slot:before>
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
              :doc="category"
              @on-edit="onEditCategoryClicked"
            />
          </q-tabs>
          <q-btn
            @click="creatingCategory = true"
            color="grey"
            outline
            rounded
            icon="add"
            label="Add category"
            size="md"
            style="margin: 12px 8px"
          />
        </div>
      </template>
      <template v-slot:after>
        <ActivityList />
        <q-btn
          @click="creatingActivity = true"
          color="grey"
          outline
          rounded
          icon="add"
          label="Add activity"
          size="md"
          style="margin: 0 16px"
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
      @on-updated="editingCategory = false"
      @on-deleted="editingCategory = false"
      :doc="currentCategory"
    />
  </q-dialog>
</template>
