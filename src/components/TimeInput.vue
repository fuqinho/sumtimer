<script setup lang="ts">
import { computed, ref } from 'vue';
import { date } from 'quasar';

const props = defineProps<{
  time: Date;
  startTime?: Date;
}>();
interface Emits {
  (e: 'onChange', time: Date): void;
}
const emit = defineEmits<Emits>();

const model = ref(date.formatDate(props.time, 'YYYY-MM-DD HH:mm:ss'));

const dayStr = computed(() => {
  const nowYear = new Date().getFullYear();
  const thisYear = props.time.getFullYear();
  if (thisYear === nowYear) {
    return date.formatDate(props.time, 'M/DD');
  } else {
    return date.formatDate(props.time, 'YYYY/M/DD');
  }
});
const timeStr = computed(() => date.formatDate(props.time, 'H:mm'));

function commitEditedTime() {
  let newTime = date.extractDate(model.value, 'YYYY-MM-DD HH:mm:ss');
  const dayInMillis = 24 * 60 * 60 * 1000;
  if (props.startTime) {
    while (newTime.getTime() < props.startTime.getTime()) {
      newTime = date.addToDate(newTime, { days: 1 });
    }
    while (newTime.getTime() >= props.startTime.getTime() + dayInMillis) {
      newTime = date.subtractFromDate(newTime, { days: 1 });
    }
  }
  emit('onChange', newTime);
}

function clearEditedTime() {
  model.value = date.formatDate(props.time, 'YYYY-MM-DD HH:mm:ss');
}
</script>

<template>
  <div class="start-time row items-center input-container">
    <div v-if="!props.startTime" class="row items-center day-container">
      <q-icon
        name="event"
        class="cursor-pointer day-icon q-pr-xs"
        size="16px"
        color="grey"
      >
        <q-popup-proxy
          cover
          transition-show="scale"
          transition-hide="scale"
          @hide="clearEditedTime"
        >
          <q-date v-model="model" mask="YYYY-MM-DD HH:mm:ss" today-btn>
            <div class="row items-center justify-end">
              <q-btn
                v-close-popup
                label="Cancel"
                color="grey-8"
                flat
                @click="clearEditedTime"
              />
              <q-btn
                v-close-popup
                label="Set"
                color="primary"
                flat
                @click="commitEditedTime"
              />
            </div>
          </q-date>
        </q-popup-proxy>
      </q-icon>
      <div class="day-str">{{ dayStr }}</div>
    </div>
    <div class="row items-center time-container">
      <q-icon
        name="access_time"
        class="cursor-pointer time-icon q-pr-xs"
        size="16px"
        color="grey"
      >
        <q-popup-proxy
          cover
          transition-show="scale"
          transition-hide="scale"
          @hide="clearEditedTime"
        >
          <q-time
            v-model="model"
            mask="YYYY-MM-DD HH:mm:ss"
            format24h
            :now-btn="!props.startTime"
          >
            <div class="row items-center justify-end">
              <q-btn
                v-close-popup
                label="Cancel"
                color="grey-8"
                flat
                @click="clearEditedTime"
              />
              <q-btn
                v-close-popup
                label="Set"
                color="primary"
                flat
                @click="commitEditedTime"
              />
            </div>
          </q-time>
        </q-popup-proxy>
      </q-icon>
      <div class="time-str" color="light-green-10">{{ timeStr }}</div>
    </div>
  </div>
</template>

<style scoped>
.input-container {
  padding: 0;
}

.day-str {
  font-size: 16px;
  color: #444;
}

.day-container {
  margin-right: 16px;
}

.time-str {
  font-size: 16px;
  color: #444;
}
</style>
