<script setup lang="ts">
import { ref } from 'vue';

const model = ref(null);
const options = [
  {
    label: 'Leaning',
    value: 'Lng',
    description: 'Learn something exciting',
  },
  {
    label: 'Work',
    value: 'Wk',
    description: 'Make some money!',
  },
];
</script>

<template>
  <div class="q-pa-md">
    <div class="q-gutter-md">
      <q-select
        filled
        v-model="model"
        :options="options"
        label="Category"
        clearable
      >
        <template v-slot:option="scope">
          <q-item v-bind="scope.itemProps">
            <q-item-section avatar>
              <q-icon name="folder" :style="{ color: '#0ff2ef' }" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ scope.opt.label }}</q-item-label>
              <q-item-label caption>{{ scope.opt.description }}</q-item-label>
            </q-item-section>
          </q-item>
        </template>
      </q-select>
    </div>
  </div>
</template>
