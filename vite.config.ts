import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';
import { copyFileSync, mkdirSync, existsSync } from 'fs';

// Custom plugin to copy static extension files to dist
function copyExtensionFiles() {
  return {
    name: 'copy-extension-files',
    writeBundle() {
      // Copy background service worker
      const bgDir = resolve(__dirname, 'dist/background');
      if (!existsSync(bgDir)) mkdirSync(bgDir, { recursive: true });
      copyFileSync(
        resolve(__dirname, 'public/background/service-worker.js'),
        resolve(__dirname, 'dist/background/service-worker.js')
      );

      // Copy content script
      const contentDir = resolve(__dirname, 'dist/content');
      if (!existsSync(contentDir)) mkdirSync(contentDir, { recursive: true });
      copyFileSync(
        resolve(__dirname, 'public/content/content-script.js'),
        resolve(__dirname, 'dist/content/content-script.js')
      );
    }
  };
}

export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss(), copyExtensionFiles()],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'index.html'),
        sidepanel: resolve(__dirname, 'sidepanel.html'),
      },
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/chunk-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      }
    },
    // Ensure content security policy compatibility
    target: 'esnext',
    minify: false, // easier debugging of extension
  },
});
