import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { crx, defineManifest } from '@crxjs/vite-plugin'

const manifest = defineManifest({
  name: 'Sumtimer',
  version: '1.0',
  manifest_version: 3,
  background: {
      service_worker: 'src/background.ts',
      type: 'module',
  },
  permissions: ['tabs', 'storage'],
  action: {},
  externally_connectable: {
      matches: [
          "https://sumtimer.com/",
          "https://sumtimer-8721e.web.app/",
          "https://sumtimer-dev.firebaseapp.com/",
          "http://localhost:5173/*"
      ]
  }
});

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    crx({manifest}),
  ]
})
