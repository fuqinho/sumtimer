<script setup lang="ts">
import ActivityForm from 'src/components/ActivityForm.vue';
import ActivityList from 'src/components/ActivityList.vue';
import CategoryTab from 'src/components/CategoryTab.vue';
import { ref } from 'vue';
import { useCategoryStore } from 'src/stores/category-store';
import { storeToRefs } from 'pinia';

const categoryStore = useCategoryStore();

const { categories } = storeToRefs(categoryStore);

const creating = ref(false);
const splitterModel = ref(20);
const tab = ref('');
</script>

<template>
  <div class="q-py-md">
    <q-splitter v-model="splitterModel">
      <template v-slot:before>
        <div class="q-py-md">
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
            />
          </q-tabs>
        </div>
      </template>
      <template v-slot:after>
        <ActivityList />
        <q-btn class="q-ma-md" @click="creating = true"
          >Add new activity.</q-btn
        >
      </template>
    </q-splitter>
  </div>

  <q-dialog v-model="creating">
    <ActivityForm @on-created="creating = false" />
  </q-dialog>
</template>
