<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import type { CachedActivity } from '@/types/documents';
import { defaultCategoryColor, defaultCategoryName } from '@/common/constants';
import { useRecordStore } from '@/stores/record-store';
import { useActivityStore } from '@/stores/activity-store';
import { useOngoingStore } from '@/stores/ongoing-store';
import { useCacheStore } from '@/stores/cache-store';
import ActivityForm from '@/components/ActivityForm.vue';
import HoursLabel from '@/components/HoursLabel.vue';
import { useUtil } from '@/composables/util';

// =========================== Properties/Emitters =============================
const props = defineProps<{
  act: CachedActivity;
}>();

// =========================== Use stores/composables ==========================
const activityStore = useActivityStore();
const recordStore = useRecordStore();
const ongoingStore = useOngoingStore();
const cacheStore = useCacheStore();
const router = useRouter();
const { lcl } = useUtil();

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
      round
      :style="{ color: categoryColor }"
      flat
      icon="play_arrow"
      @click="startActivity"
    />
    <q-item-section>
      <q-item-label caption class="ellipsis" :style="{ color: categoryColor }">
        {{ lcl(categoryName) }}
      </q-item-label>
      <q-item-label class="activity-name ellipsis">
        {{ lcl(props.act.data.label) }}
      </q-item-label>
    </q-item-section>
    <q-item-section side>
      <q-item-label caption
        ><q-icon outlined name="access_time" size="13px"
      /></q-item-label>
      <q-item-label v-if="!!numRecords" class="records-num">
        <router-link
          :to="{ name: 'ActivityRecords', params: { aid: props.act.id } }"
          >{{ numRecords }}
        </router-link>
      </q-item-label>
      <q-item-label v-else class="records-num"> 0 </q-item-label>
    </q-item-section>
    <q-item-section side style="min-width: 56px; padding-left: 6px">
      <q-item-label caption>{{ $t('total') }}</q-item-label>
      <HoursLabel :ms="props.act.data.duration" class="hours-label" />
    </q-item-section>
    <q-item-section side style="padding-left: 8px">
      <div class="text-grey-7 q-gutter-xs">
        <q-btn size="sm" round flat icon="more_vert">
          <q-menu>
            <q-list dense>
              <q-item v-close-popup clickable @click="editing = true">
                <q-item-section>{{ $t('edit') }}</q-item-section>
              </q-item>
              <q-item v-close-popup clickable @click="startDeleteActivity">
                <q-item-section>{{ $t('delete') }}</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
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
          {{ $t('msgConfirmActivityRecords', { num: numRecords }) }}
        </span>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn v-close-popup flat :label="$t('cancelBtn')" color="primary" />
        <q-btn
          v-close-popup
          flat
          :label="$t('deleteRecordsBtn')"
          color="primary"
          @click="deleteActivity"
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
.records-num {
  font-size: 16px;
  margin-top: 0 !important;
}

.records-num {
  color: #444;
}

.hours-label {
  margin-top: -4px;
  height: 24px;
}
</style>
