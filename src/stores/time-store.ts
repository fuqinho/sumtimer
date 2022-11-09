import { ref } from 'vue';
import { defineStore } from 'pinia';

export const useTimeStore = defineStore('times', () => {
  const nowMillis = ref(Date.now());

  setInterval(() => {
    nowMillis.value = Date.now();
  }, 1000);

  return { nowMillis };
});
