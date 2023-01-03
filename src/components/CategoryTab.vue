<script setup lang="ts">
import { computed } from 'vue';
import type { CachedCategory } from '@/types/documents';
import { useCategoryStore } from '@/stores/category-store';

const props = defineProps<{
  cat?: CachedCategory;
}>();
const categoryStore = useCategoryStore();

const color = computed(() => {
  return props.cat ? props.cat.data.color : '#444';
});

const label = computed(() => {
  return props.cat ? props.cat.data.label : 'All activities';
});

const name = computed(() => {
  return props.cat ? props.cat.id : '';
});

const icon = computed(() => {
  return props.cat ? 'folder' : 'storage';
});

const toTarget = computed(() => {
  if (props.cat) {
    return {
      name: 'CategoryActivities',
      params: {
        cid: props.cat.id,
      },
    };
  } else {
    return { name: 'AllActivities' };
  }
});

async function moveUp() {
  if (props.cat) await categoryStore.moveUp(props.cat.id);
}

async function moveDown() {
  if (props.cat) await categoryStore.moveDown(props.cat.id);
}
</script>

<template>
  <q-route-tab
    :style="{ color: color }"
    :name="name"
    :to="toTarget"
    class="category-tab"
    content-class="content"
    active-class="tab-active"
  >
    <q-item class="">
      <q-item-section class="folder-icon">
        <q-icon size="22px" :name="icon" />
      </q-item-section>
      <q-item-section class="category-name">
        <div class="text-ellipsis">{{ label }}</div>
      </q-item-section>
      <q-space />
      <q-item-section v-if="!!props.cat" class="actions" side>
        <div class="row">
          <div class="column">
            <q-icon
              name="arrow_drop_up"
              size="xs"
              @click.prevent="moveUp"
            ></q-icon>
            <q-icon
              name="arrow_drop_down"
              size="xs"
              @click.prevent="moveDown"
            ></q-icon>
          </div>
        </div>
      </q-item-section>
    </q-item>
  </q-route-tab>
</template>

<style>
.category-tab .content {
  flex: auto;
  padding: 0;
}

.category-tab.tab-active {
  font-weight: 500;
}

.category-tab .q-item {
  width: 100%;
  padding: 0 2px;
}

.category-tab .folder-icon {
  flex: none;
}

.category-tab .category-name {
  flex: auto;
  font-size: 16px;
  text-align: start;
}

.category-tab .text-ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
}

.category-tab .actions {
  flex: none;
  padding-left: 0 !important;
}
</style>
