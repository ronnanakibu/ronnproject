import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    target: 'es2023',
    minify: 'esbuild',
    rollupOptions: {
      output: {
        // Keep chunks small for the 20KB gzip budget
        manualChunks: undefined,
      },
    },
  },
});

