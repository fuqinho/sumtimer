<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { getAuth, signOut } from 'firebase/auth';
import { useAuthStore } from '@/stores/auth-store';
import { useCacheStore } from '@/stores/cache-store';
import { useOngoingStore } from '@/stores/ongoing-store';
import TimeDisplay from '@/components/TimeDisplay.vue';
import SigninButton from '@/components/SigninButton.vue';

const router = useRouter();
const authStore = useAuthStore();
const cacheStore = useCacheStore();
const ongoingStore = useOngoingStore();
const { isSignedIn, userProfilePicUrl, userDisplayName, userEmail } =
  storeToRefs(authStore);
const { idToCategory, idToActivity } = storeToRefs(cacheStore);
const { ongoing, elapsedMillis } = storeToRefs(ongoingStore);

const bgColor = computed(() => {
  if (ongoing.value) {
    const activity = idToActivity.value[ongoing.value.aid];
    if (activity) {
      const category = idToCategory.value[activity.cid];
      if (category) return category.color;
    }
  }
  return '#757575';
});

function signOutUser() {
  signOut(getAuth());
}
</script>

<template>
  <q-layout view="hHh lpR fFf">
    <q-header
      reveal
      bordered
      class="text-white"
      :style="{ backgroundColor: bgColor }"
      height-hint="98"
    >
      <q-toolbar>
        <q-toolbar-title>
          <q-avatar>
            <img src="../assets/sumtimer-logo.svg" />
          </q-avatar>
          Sumtimer
        </q-toolbar-title>

        <q-item v-if="ongoing" class="q-py-none">
          <TimeDisplay
            class="ongoing"
            :time="elapsedMillis"
            whity
            @click="router.push('/')"
          />
        </q-item>

        <q-item v-if="isSignedIn" v-ripple clickable>
          <q-item-section v-if="!!userProfilePicUrl" avatar class="profile-pic">
            <q-avatar> <img :src="userProfilePicUrl" /> </q-avatar>
          </q-item-section>
          <q-menu>
            <q-list>
              <q-item>
                <q-item-section avatar>
                  <q-avatar> <img :src="userProfilePicUrl" /></q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ userDisplayName }}</q-item-label>
                  <q-item-label caption>{{ userEmail }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item v-close-popup clickable @click="router.push('/settings')">
                <q-item-section side>
                  <q-icon name="settings" />
                </q-item-section>
                <q-item-section>Settings</q-item-section>
              </q-item>
              <q-item v-close-popup clickable>
                <q-item-section side>
                  <q-icon name="logout" />
                </q-item-section>
                <q-item-section @click="signOutUser">Sign out</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-item>
        <SigninButton v-else />
      </q-toolbar>

      <q-tabs v-if="isSignedIn" align="left">
        <q-route-tab to="/" :label="$t('tabHome')" />
        <q-route-tab to="/activities" :label="$t('tabActivities')" />
        <q-route-tab to="/history" :label="$t('tabHistory')" />
        <q-route-tab to="/settings" :label="$t('tabSettings')" />
      </q-tabs>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<style scoped>
.ongoing {
  cursor: pointer;
}
.profile-pic {
  padding: 0;
  margin: 0;
  min-width: 0;
}
</style>
