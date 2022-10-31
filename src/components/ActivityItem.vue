<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { CachedActivity } from 'src/types/documents';
import {
  defaultCategoryColor,
  defaultCategoryName,
} from 'src/common/constants';
import { useRecordStore } from 'src/stores/record-store';
import { useActivityStore } from 'src/stores/activity-store';
import { useOngoingStore } from 'src/stores/ongoing-store';
import { useCacheStore } from 'src/stores/cache-store';
import ActivityForm from 'src/components/ActivityForm.vue';

// =========================== Properties/Emitters =============================
interface Props {
  act: CachedActivity;
}
const props = defineProps<Props>();

// =========================== Use stores/composables ==========================
const activityStore = useActivityStore();
const recordStore = useRecordStore();
const ongoingStore = useOngoingStore();
const cacheStore = useCacheStore();
const router = useRouter();

// =========================== Refs ============================================
const editing = ref(false);
const confirm = ref(false);
const { idToCategory } = storeToRefs(cacheStore);

// =========================== Computed properties =============================
const categoryName = computed(() => {
  return idToCategory.value[props.act.data.cid].label || defaultCategoryName;
});
const categoryColor = computed(() => {
  return idToCategory.value[props.act.data.cid].color || defaultCategoryColor;
});
const numRecords = computed(() => {
  return props.act.data.count;
});
const totalHours = computed(() => {
  return (props.act.data.duration / (60 * 60 * 1000)).toFixed(1);
});

// =========================== Methods =========================================
async function startActivity() {
  await ongoingStore.start(props.act.id);
  router.push('/');
}

async function startDeleteActivity() {
  if (!numRecords.value) {
    await deleteActivity();
  } else {
    confirm.value = true;
  }
}

async function deleteActivity() {
  const aid = props.act.id;
  await recordStore.deleteRecordsByActivityId(aid);
  await activityStore.deleteActivity(aid);
}
</script>

<template>
  <q-item class="activity" dense>
    <div
      class="color-label"
      :style="{
        'background-color': categoryColor,
      }"
    ></div>
    <q-btn
      @click="startActivity"
      round
      :style="{ color: categoryColor }"
      flat
      icon="play_arrow"
    />
    <q-item-section>
      <q-item-label caption :style="{ color: categoryColor }">{{
        categoryName
      }}</q-item-label>
      <q-item-label class="activity-name">
        {{ props.act.data.label }}
      </q-item-label>
    </q-item-section>
    <q-item-section side>
      <q-item-label caption>Records</q-item-label>
      <q-item-label v-if="!!numRecords" class="records-num">
        <router-link
          :to="{ name: 'ActivityRecords', params: { aid: props.act.id } }"
          >{{ numRecords }}
        </router-link>
      </q-item-label>
      <q-item-label v-else class="records-num"> 0 </q-item-label>
    </q-item-section>
    <q-item-section side>
      <q-item-label caption>Hours</q-item-label>
      <q-item-label class="total-hours">{{ totalHours }}</q-item-label>
    </q-item-section>
    <q-item-section side>
      <div class="text-grey-7 q-gutter-xs">
        <q-btn size="sm" @click="editing = true" round flat icon="edit" />
        <q-btn
          size="sm"
          @click="startDeleteActivity"
          round
          flat
          icon="delete"
        />
      </div>
    </q-item-section>
  </q-item>

  <q-dialog v-model="editing">
    <ActivityForm :act="props.act" @on-updated="editing = false" />
  </q-dialog>

  <q-dialog v-model="confirm">
    <q-card style="min-width: 350px">
      <q-card-section class="row items-center">
        <q-avatar icon="warning" color="white" text-color="red" />
        <span class="q-ml-sm">
          Are you OK to delete {{ numRecords }} records about this activity?
        </span>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Cancel" color="primary" v-close-popup />
        <q-btn
          @click="deleteActivity"
          flat
          label="Delete records"
          color="primary"
          v-close-popup
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style scoped>
.activity {
  padding: 0 !important;
}

.color-label {
  width: 8px;
  height: 42px;
  background-color: red;
}

.activity-name,
.records-num,
.total-hours {
  font-size: 16px;
  margin-top: 0 !important;
}

.records-num,
.total-hours {
  color: #444;
}
</style>
