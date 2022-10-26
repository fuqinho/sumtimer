<script setup lang="ts">
import { computed, ref } from 'vue';
import { date } from 'quasar';

interface Props {
  time: Date;
  startTime?: Date;
}
const props = defineProps<Props>();
interface Emits {
  (e: 'onChange', time: Date): void;
}
const emit = defineEmits<Emits>();

const model = ref(date.formatDate(props.time, 'YYYY-MM-DD HH:mm:ss'));

const dayStr = computed(() => {
  const nowYear = new Date().getFullYear();
  const thisYear = props.time.getFullYear();
  if (thisYear === nowYear) {
    return date.formatDate(props.time, 'MM/DD');
  } else {
    return date.formatDate(props.time, 'YYYY/MM/DD');
  }
});
const timeStr = computed(() => date.formatDate(props.time, 'HH:mm'));

function commitEditedTime() {
  let newTime = date.extractDate(model.value, 'YYYY-MM-DD HH:mm:ss');
  if (props.startTime && newTime.getTime() < props.startTime.getTime()) {
    newTime = date.addToDate(newTime, { days: 1 });
  }
  if (
    props.startTime &&
    newTime.getTime() > props.startTime.getTime() + 24 * 60 * 60 * 1000
  ) {
    newTime = date.subtractFromDate(newTime, { days: 1 });
  }
  emit('onChange', newTime);
}

function clearEditedTime() {
  model.value = date.formatDate(props.time, 'YYYY-MM-DD HH:mm:ss');
}
</script>

<template>
  <div class="start-time row items-center">
    <div v-if="!props.startTime" class="row items-center">
      <q-icon name="event" class="cursor-pointer" size="xs" color="grey">
        <q-popup-proxy
          @hide="clearEditedTime"
          cover
          transition-show="scale"
          transition-hide="scale"
        >
          <q-date v-model="model" mask="YYYY-MM-DD HH:mm:ss" today-btn>
            <div class="row items-center justify-end">
              <q-btn
                @click="clearEditedTime"
                v-close-popup
                label="Cancel"
                color="grey-8"
                flat
              />
              <q-btn
                @click="commitEditedTime"
                v-close-popup
                label="Set"
                color="primary"
                flat
              />
            </div>
          </q-date>
        </q-popup-proxy>
      </q-icon>
      <div class="day-str">{{ dayStr }}</div>
    </div>
    <div class="row items-center">
      <q-icon name="access_time" class="cursor-pointer" size="xs" color="grey">
        <q-popup-proxy
          @hide="clearEditedTime"
          cover
          transition-show="scale"
          transition-hide="scale"
        >
          <q-time
            v-model="model"
            mask="YYYY-MM-DD HH:mm:ss"
            format24h
            :now-btn="!props.startTime"
          >
            <div class="row items-center justify-end">
              <q-btn
                @click="clearEditedTime"
                v-close-popup
                label="Cancel"
                color="grey-8"
                flat
              />
              <q-btn
                @click="commitEditedTime"
                v-close-popup
                label="Set"
                color="primary"
                flat
              />
            </div>
          </q-time>
        </q-popup-proxy>
      </q-icon>
      <div class="time-str">{{ timeStr }}</div>
    </div>
  </div>
</template>

<style scoped>
.day-str {
  font-size: 20px;
  margin-left: 2px;
  margin-right: 8px;
}

.time-str {
  margin-left: 2px;
  font-size: 20px;
  margin-right: 4px;
}
</style>
