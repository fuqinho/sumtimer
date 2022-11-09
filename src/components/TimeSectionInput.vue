<script setup lang="ts">
import { computed } from 'vue';
import TimeInput from '@/components/TimeInput.vue';
import TimeDisplay from '@/components/TimeDisplay.vue';

const props = defineProps<{
  start: Date;
  end: Date;
  min?: Date;
  max?: Date;
}>();
interface Emits {
  (e: 'onChangeStart', time: Date): void;
  (e: 'onChangeEnd', time: Date): void;
}
const emit = defineEmits<Emits>();

const duration = computed(() => {
  return props.end.getTime() - props.start.getTime();
});
</script>

<template>
  <div class="row items-center">
    <TimeInput :time="props.start" @on-change="emit('onChangeStart', $event)" />
    <div class="nyoro">~</div>
    <TimeInput
      :time="props.end"
      :start-time="props.start"
      @on-change="emit('onChangeEnd', $event)"
    />
    <q-space />
    <TimeDisplay :time="duration" size="small" class="duration" />
  </div>
</template>

<style scoped>
.nyoro {
  font-size: 18px;
  margin: 0 6px;
}
.duration {
  margin-top: 2px;
  margin-left: 20px;
}
</style>
