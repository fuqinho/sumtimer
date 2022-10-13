<script setup lang="ts">
import { getFirestore, collection, deleteDoc, doc } from 'firebase/firestore';

interface Props {
  id: string;
  name: string;
  color?: string;
}

const props = defineProps<Props>();

function categoryColor(): string {
  return props.color || '#aaaaaa';
}

function categoryFgColor(): string {
  const bgColor = categoryColor();
  if (bgColor[1] >= 'c' && bgColor[3] >= 'c' && bgColor[5] >= 'c') {
    console.log(bgColor);
    return '#222222';
  } else {
    return '#ffffff';
  }
}

function deleteCategory() {
  const docRef = doc(getFirestore(), 'categories', props.id);
  deleteDoc(docRef);
}
</script>

<template>
  <q-card class="category-card">
    <q-card-section
      :style="{ color: categoryFgColor(), 'background-color': categoryColor() }"
    >
      <div class="text-h6">{{ props.name }}</div>
    </q-card-section>
    <q-separator />
    <q-card-actions align="right">
      <q-btn flat>Edit</q-btn>
      <q-btn @click="deleteCategory" flat>Delete</q-btn>
    </q-card-actions>
  </q-card>
</template>

<style lang="scss" scoped>
.category-card {
  max-width: 250px;
}
</style>
