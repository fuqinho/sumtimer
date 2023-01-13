<script setup lang="ts">
import { useUserStore } from '@/stores/user-store';
import { storeToRefs } from 'pinia';
import { ref, watch, onMounted } from 'vue';

const userStore = useUserStore();
const { currentLocale } = storeToRefs(userStore);

const localeOptions = [
  { value: 'en-US', label: 'English' },
  { value: 'ja-JP', label: '日本語' },
];
const selectedOption = ref(pickOption(currentLocale.value));

function pickOption(locValue: string) {
  for (const opt of localeOptions) {
    if (opt.value === locValue) return opt;
  }
  return localeOptions[0];
}

onMounted(() => {
  watch(currentLocale, (newLocale) => {
    const newOption = pickOption(newLocale);
    if (selectedOption.value.value != newOption.value) {
      console.log('Set locale option to ', newOption.value);
      selectedOption.value = newOption;
    }
  });

  watch(selectedOption, (newLocale) => {
    if (newLocale.value !== currentLocale.value) {
      console.log('Change locale to ', newLocale.value);
      userStore.setLocale(newLocale.value);
    }
  });
});
</script>

<template>
  <q-list>
    <q-item-label header>{{ $t('stPreferences') }}</q-item-label>
    <q-item>
      <q-item-section>
        <q-item-label>{{ $t('stUiLanguage') }}</q-item-label>
      </q-item-section>
      <q-item-section side>
        <q-select v-model="selectedOption" :options="localeOptions" dense>
        </q-select>
      </q-item-section>
    </q-item>
  </q-list>
</template>
