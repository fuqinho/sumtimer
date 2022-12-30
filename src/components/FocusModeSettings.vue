<script setup lang="ts">
import { useCacheStore } from '@/stores/cache-store';
import { useFocusModeStore } from '@/stores/focus-mode-store';
import { storeToRefs } from 'pinia';
import { ref, watch } from 'vue';

const cacheStore = useCacheStore();
const focusModeStore = useFocusModeStore();

const { categories } = storeToRefs(cacheStore);

const hasValidExtension = ref(false);
const enabledModel = ref(false);
const enabledCategories = ref([] as string[]);
const urlBlockListModel = ref('');
const titleBlockListModel = ref('');

async function setExtensionSettings() {
  // Block patterns (URL)
  const urlPatterns = urlBlockListModel.value
    .split(/\r?\n/)
    .map((v) => v.trim())
    .filter((v) => !!v);
  urlBlockListModel.value = urlPatterns.join('\n');
  const urlResult = await focusModeStore.setUrlBlockPatterns(urlPatterns);

  // Block patterns (Page title)
  const titlePatterns = titleBlockListModel.value
    .split(/\r?\n/)
    .map((v) => v.trim())
    .filter((v) => !!v);
  titleBlockListModel.value = titlePatterns.join('\n');
  const titleResult = await focusModeStore.setTitleBlockPatterns(titlePatterns);

  // Focus categories
  const catsResult = await focusModeStore.setFocusCategories(
    enabledCategories.value
  );

  console.log('setExtensionSettings: ', urlResult, titleResult, catsResult);
}

async function fillExtensionSetting() {
  const urlPatterns = await focusModeStore.getUrlBlockPatterns();
  urlBlockListModel.value = urlPatterns.join('\n');
  const titlePatterns = await focusModeStore.getTitleBlockPatterns();
  titleBlockListModel.value = titlePatterns.join('\n');
  enabledCategories.value = await focusModeStore.getFocusCategories();
}

async function onEnabledChanged(newEnabled: boolean, oldEnabled: boolean) {
  console.log('onEnabledChanged from', oldEnabled, 'to', newEnabled);
  if (newEnabled) {
    // Enabled by user interaction.
    let success = false;
    success = await focusModeStore.setConfiguration();
    if (!success) {
      enabledModel.value = false;
      return;
    }
    success = await focusModeStore.signIn();
    if (!success) {
      enabledModel.value = false;
      return;
    }
    success = await focusModeStore.setEnabled(true);
    if (!success) {
      enabledModel.value = false;
      return;
    }
    fillExtensionSetting();
  } else {
    const extensionEnabled = await focusModeStore.isEnabled();
    if (!extensionEnabled) return;

    // Disabled by user interaction.
    let success = false;
    success = await focusModeStore.setEnabled(false);
    if (!success) {
      console.error('failed to setEnabled(false)');
      return;
    }
    success = await focusModeStore.signOut();
    if (!success) {
      console.error('failed to signOut()');
      return;
    }
  }
}

async function init() {
  hasValidExtension.value = await focusModeStore.hasValidExtension();
  console.log('hasValidExtension: ', hasValidExtension.value);
  if (hasValidExtension.value) {
    enabledModel.value = await focusModeStore.isEnabled();
    if (enabledModel.value) {
      // Focus mode is already enabled. Just fill the extension settings.
      fillExtensionSetting();
    }
    watch(enabledModel, onEnabledChanged);
  }
}

init();
</script>

<template>
  <q-list>
    <q-item v-ripple>
      <q-item-section>
        <q-item-label>Focus mode</q-item-label>
        <q-item-label caption>Chrome extension is required.</q-item-label>
      </q-item-section>
      <q-item-section avatar>
        <q-toggle
          v-model="enabledModel"
          :disable="!hasValidExtension"
          color="blue"
        ></q-toggle>
      </q-item-section>
    </q-item>
    <q-item v-if="enabledModel">
      <q-item-section>
        <q-list>
          <q-item>
            <q-item-section>
              <q-input
                v-model="urlBlockListModel"
                type="textarea"
                filled
                label="Block list (URL)"
                cledarable
              />
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section>
              <q-input
                v-model="titleBlockListModel"
                type="textarea"
                filled
                label="Block list (Page title)"
                cledarable
              />
            </q-item-section>
          </q-item>
          <q-item>
            <q-list>
              <q-item v-for="cat in categories" :key="cat.id">
                <q-item-section>
                  <q-item-label>{{ cat.data.label }}</q-item-label>
                </q-item-section>
                <q-item-section avatar>
                  <q-checkbox v-model="enabledCategories" :val="cat.id" />
                </q-item-section>
              </q-item>
            </q-list>
          </q-item>
          <q-item>
            <q-btn @click="setExtensionSettings">
              Update extension settings
            </q-btn>
          </q-item>
        </q-list>
      </q-item-section>
    </q-item>
  </q-list>
  <q-separator />
</template>
