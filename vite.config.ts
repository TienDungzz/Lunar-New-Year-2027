import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        onlyExplicitManualChunks: true,
        manualChunks(id) {
          const name = id.replaceAll('\\', '/');
          if (/\/node_modules\/(react|react-dom|scheduler)\//.test(name)) return 'react';
          if (name.includes('/node_modules/three/')) return 'three';
          if (name.includes('/node_modules/@react-three/') || name.includes('/node_modules/three-stdlib/')) return 'scene-libs';
        },
      },
    },
  },
});
