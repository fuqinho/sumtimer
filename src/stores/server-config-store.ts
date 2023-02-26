import type { ServerConfigData } from '@/types/documents';
import { doc, getFirestore, onSnapshot } from 'firebase/firestore';
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useServerConfigStore = defineStore('server-config', () => {
  const latestVersion = ref(0);
  const requiredVersion = ref(0);
  const signupDisabled = ref(false);

  onSnapshot(doc(getFirestore(), 'configs', 'server'), (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.data() as ServerConfigData;
      latestVersion.value = data.latestVersion || 0;
      requiredVersion.value = data.requiredVersion || 0;
      signupDisabled.value = !!data.signupDisabled;
    }
  });

  return {
    latestVersion,
    requiredVersion,
    signupDisabled,
  };
});
