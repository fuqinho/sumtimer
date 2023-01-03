<script setup lang="ts">
import { useCacheStore } from '@/stores/cache-store';
import { useFocusModeStore } from '@/stores/focus-mode-store';
import { storeToRefs } from 'pinia';
import { ref, watch } from 'vue';
import { useQuasar } from 'quasar';

const cacheStore = useCacheStore();
const focusModeStore = useFocusModeStore();
const $q = useQuasar();

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
  await focusModeStore.setUrlBlockPatterns(urlPatterns);

  // Block patterns (Page title)
  const titlePatterns = titleBlockListModel.value
    .split(/\r?\n/)
    .map((v) => v.trim())
    .filter((v) => !!v);
  titleBlockListModel.value = titlePatterns.join('\n');
  await focusModeStore.setTitleBlockPatterns(titlePatterns);

  // Focus categories
  await focusModeStore.setFocusCategories(enabledCategories.value);

  $q.notify({
    type: 'positive',
    message: `Successfully updated extension settings.`,
  });
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
            <div class="q-gutter-sm">
              <div
                v-for="cat in categories"
                :key="cat.id"
                class="cat-boxes shadow-1 q-pa-sm"
              >
                <span>
                  <q-checkbox
                    v-model="enabledCategories"
                    :val="cat.id"
                    size="xs"
                  />
                </span>
                <span>{{ cat.data.label }}</span>
              </div>
            </div>
          </q-item>
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
            <q-btn color="primary" @click="setExtensionSettings">
              Update extension settings
            </q-btn>
          </q-item>
        </q-list>
      </q-item-section>
    </q-item>
  </q-list>
  <q-separator />
</template>

<style scoped>
.cat-boxes {
  display: inline-flex;
  align-items: center;
}
</style>
