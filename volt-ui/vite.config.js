import { defineConfig, searchForWorkspaceRoot } from 'vite';
import solidPlugin from 'vite-plugin-solid';

export default defineConfig({
  plugins: [solidPlugin()],
  base: '/apps/volt/',
  server: {
    port: 3000,
    fs: {
      // Allow serving files from one level up to the project root
      allow: [
        searchForWorkspaceRoot(process.cwd()),
      ]
    }
  },
  build: {
    target: 'esnext',
    rollupOptions: {
      external: [
        //"/session.js"
      ]
    }
  },
});
