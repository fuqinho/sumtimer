<script setup lang="ts">
import { useAuthStore } from '@/stores/auth-store';
import {
  deleteUser,
  GoogleAuthProvider,
  reauthenticateWithPopup,
  type UserCredential,
} from '@firebase/auth';
import { storeToRefs } from 'pinia';
import { useQuasar } from 'quasar';
import { ref } from 'vue';

const authStore = useAuthStore();
const $q = useQuasar();

const { user, userEmail } = storeToRefs(authStore);

const confirming = ref(false);
const emailModel = ref('');

function getOneProviderId() {
  if (!user.value || user.value.providerData.length < 1) return '';
  return user.value.providerData[0].providerId;
}

async function deleteAccount() {
  if (!user.value) return;
  const currentProviderId = getOneProviderId();
  if (!currentProviderId) return;

  let credential = null as UserCredential | null;
  if (currentProviderId === GoogleAuthProvider.PROVIDER_ID) {
    const provider = new GoogleAuthProvider();
    credential = await reauthenticateWithPopup(user.value, provider);
    deleteUser(credential.user);
  }
  if (!credential) {
    $q.notify({
      type: 'negative',
      message: 'Failed to reauthenticate the user to delete the user.',
    });
    return;
  }

  deleteUser(credential.user);
  $q.notify({
    type: 'info',
    message: 'Deleted the user. Sining out...',
  });
}
</script>

<template>
  <q-list>
    <q-item-label header>Danger zone</q-item-label>
    <q-item>
      <q-item-section>
        <q-item-label>Delete account</q-item-label>
        <q-item-label caption>
          Delete your account from Sumtimer. It also deletes all stored data
          such as records, activities, and categories permanently.
        </q-item-label>
      </q-item-section>
      <q-item-section side>
        <q-btn color="red" @click="confirming = true">Delete account</q-btn>
      </q-item-section>
    </q-item>
  </q-list>

  <q-dialog v-model="confirming" persistent>
    <q-card style="min-width: 350px">
      <q-card-section>
        <div class="text-h6" color="red">Delete data</div>
      </q-card-section>
      <q-card-section>
        <q-avatar icon="warning" color="white" text-color="red" />
        <span class="q-ml-sm">
          Please enter your email address to delete all data.
        </span>
      </q-card-section>
      <q-card-section class="q-pt-none">
        <q-input v-model="emailModel" dense autofocus />
      </q-card-section>
      <q-card-actions align="right">
        <q-btn v-close-popup flat label="Cancel" />
        <q-btn
          v-close-popup
          :disable="emailModel !== userEmail"
          flat
          label="Delete"
          color="red"
          @click="deleteAccount"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
