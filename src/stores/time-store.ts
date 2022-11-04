import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useTimeStore = defineStore('times', () => {
  const nowMillis = ref(Date.now());

  setInterval(() => {
    nowMillis.value = Date.now();
  }, 1000);

  return { nowMillis };
});
