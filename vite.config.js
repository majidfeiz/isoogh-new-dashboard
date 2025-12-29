import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  esbuild: {
    jsxFactory: 'h',
    jsxFragment: 'Fragment',
  },
  resolve: {
    alias: {
      // CKEditor bare specifier fix (otherwise browser sees an unresolved bare import)
      '@ckeditor/ckeditor5-watchdog': path.resolve(__dirname, 'node_modules/@ckeditor/ckeditor5-watchdog/dist/index.js'),
    },
  },
  optimizeDeps: {
    include: ['@ckeditor/ckeditor5-watchdog'],
  },
})
