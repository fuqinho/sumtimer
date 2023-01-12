<script setup lang="ts">
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
const { locale } = useI18n({ useScope: 'global' });
const localeOptions = [
  { value: 'en-US', label: 'English' },
  { value: 'ja-JP', label: '日本語' },
];
const selectedOption = ref(
  locale.value === 'en-US' ? localeOptions[0] : localeOptions[1]
);
locale.value = selectedOption.value.value;
watch(selectedOption, (newLocale) => {
  locale.value = newLocale.value;
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
