<script setup lang="ts">
import { ref } from 'vue';
import {
  getFirestore,
  collection,
  query,
  onSnapshot,
} from 'firebase/firestore';
import { CategoryDocumentData } from './models';
import CategoryItem from './CategoryItem.vue';

const categories = ref<{ id: string; data: CategoryDocumentData }[]>([]);

function addCategory(id: string, data: CategoryDocumentData) {
  categories.value.push({ id: id, data: data });
}

function removeCategory(id: string) {
  for (let i = 0; i < categories.value.length; i++) {
    if (categories.value[i].id == id) {
      categories.value.splice(i, 1);
      break;
    }
  }
}

function modifyCategory(id: string, data: CategoryDocumentData) {
  for (let i = 0; i < categories.value.length; i++) {
    if (categories.value[i].id == id) {
      categories.value[i].data == data;
      break;
    }
  }
}

const categoriesQuery = query(collection(getFirestore(), 'categories'));
onSnapshot(categoriesQuery, (snapshot) => {
  snapshot.docChanges().forEach((change) => {
    if (change.type == 'removed') {
      removeCategory(change.doc.id);
    } else if (change.type === 'added') {
      addCategory(change.doc.id, change.doc.data() as CategoryDocumentData);
    } else {
      modifyCategory(change.doc.id, change.doc.data() as CategoryDocumentData);
    }
  });
});
</script>

<template>
  <div>
    <CategoryItem
      v-for="category in categories"
      :key="category.id"
      :name="category.data.name"
      :color="category.data.color"
    ></CategoryItem>
  </div>
</template>
