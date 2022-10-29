<script setup lang="ts">
import { CategoryDoc } from 'src/types/documents';
import { useCategoryStore } from 'src/stores/category-store';
import { computed } from 'vue';

interface Props {
  doc?: CategoryDoc;
}
const props = defineProps<Props>();
interface Emits {
  (e: 'onEdit', cid: string): void;
}
const emit = defineEmits<Emits>();

const categoryStore = useCategoryStore();

const color = computed(() => {
  return props.doc ? props.doc.data.color : '#444';
});

const label = computed(() => {
  return props.doc ? props.doc.data.label : 'All activities';
});

const name = computed(() => {
  return props.doc ? props.doc.id : '';
});

const icon = computed(() => {
  return props.doc ? 'folder' : 'storage';
});

const toTarget = computed(() => {
  if (props.doc) {
    return {
      name: 'CategoryActivities',
      params: {
        cid: props.doc.id,
      },
    };
  } else {
    return { name: 'Activities' };
  }
});

async function moveUp() {
  if (props.doc) await categoryStore.moveUp(props.doc.id);
}

async function moveDown() {
  if (props.doc) await categoryStore.moveDown(props.doc.id);
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
        <q-icon size="sm" :name="icon" />
      </q-item-section>
      <q-item-section class="category-name">
        <div class="text-ellipsis">{{ label }}</div>
      </q-item-section>
      <q-space />
      <q-item-section v-if="!!props.doc" class="actions" side>
        <div class="row">
          <q-btn
            @click.prevent="emit('onEdit', name)"
            size="sm"
            round
            flat
            icon="edit"
            class="self-center"
          ></q-btn>
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

  <q-dialog> </q-dialog>
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
