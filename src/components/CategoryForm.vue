<script setup lang="ts">
import { ref } from 'vue';
import { defaultColorPalette, defaultCategoryColor } from './constants';
import { useUserDataStore } from 'stores/user-data-store';

const name = ref('');
const color = ref(defaultCategoryColor);
const userStore = useUserDataStore();

async function onSubmit() {
  try {
    if (userStore.uid && name.value) {
      userStore.addCategory(name.value, color.value);
    }
  } catch (e) {
    console.error('Failed to add a category to the collection.', e);
  }
}
</script>

<template>
  <div class="q-pa-md">
    <q-form @submit="onSubmit">
      <div class="q-gutter-md row items-start">
        <q-input v-model="name" filled label="Category Name" />
        <q-input v-model="color" filled>
          <template v-slot:append>
            <q-icon name="colorize" class="cursor-pointer">
              <q-popup-proxy
                cover
                transition-show="scale"
                transition-hide="scale"
              >
                <q-color
                  v-model="color"
                  no-header
                  default-view="palette"
                  class="cpicker"
                  :palette="defaultColorPalette"
                />
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>
        <q-avatar :style="{ 'background-color': color }" />
      </div>
      <q-btn
        label="Add new category"
        class="q-my-md"
        type="submit"
        color="primary"
      />
    </q-form>
  </div>
</template>

<style lang="scss">
.cpicker {
  max-width: 300px;
}
</style>