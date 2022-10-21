<script setup lang="ts">
import { computed } from 'vue';
import { date } from 'quasar';

// =========================== Properties/Emitters =============================
interface Props {
  time: Date;
}
const props = defineProps<Props>();
const emit = defineEmits(['update:time']);

// =========================== Use stores/composables ==========================
// =========================== Computed properties =============================
const model = computed({
  get: () => date.formatDate(props.time, 'YYYY-MM-DD HH:mm'),
  set: (str) => {
    const newDate = date.extractDate(str, 'YYYY-MM-DD HH:mm');
    emit('update:time', newDate);
  },
});

// =========================== Refs ============================================
// =========================== Methods =========================================
// =========================== Additional setup ================================
</script>

<template>
  <q-input filled v-model="model">
    <template v-slot:prepend>
      <q-icon name="event" class="cursor-pointer">
        <q-popup-proxy cover transition-show="scale" transition-hide="scale">
          <q-date v-model="model" mask="YYYY-MM-DD HH:mm">
            <div class="row items-center justify-end">
              <q-btn v-close-popup label="Close" color="primary" flat />
            </div>
          </q-date>
        </q-popup-proxy>
      </q-icon>
    </template>

    <template v-slot:append>
      <q-icon name="access_time" class="cursor-pointer">
        <q-popup-proxy cover transition-show="scale" transition-hide="scale">
          <q-time v-model="model" mask="YYYY-MM-DD HH:mm">
            <div class="row items-center justify-end">
              <q-btn v-close-popup label="Close" color="primary" flat />
            </div>
          </q-time>
        </q-popup-proxy>
      </q-icon>
    </template>
  </q-input>
</template>
