import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';

export default defineConfig({
  plugins: [solidPlugin()],
  base: '/apps/volt/',
  server: {
    port: 3000
  },
  build: {
    target: 'esnext',
    rollupOptions: {
//      external: [
//        "/session.js"
//      ]
    }
  },
});
