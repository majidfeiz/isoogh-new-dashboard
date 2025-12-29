import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  esbuild: {
    jsxFactory: 'h',
    jsxFragment: 'Fragment',
  },
  resolve: {
    alias: {
      // CKEditor bare specifier fix: point to local shim to avoid missing optional dep issues
      '@ckeditor/ckeditor5-watchdog': path.resolve(__dirname, 'src/shims/ckeditor5-watchdog.js'),
      '@ckeditor/ckeditor5-react': require.resolve('@ckeditor/ckeditor5-react'),
    },
  },
  optimizeDeps: {
    include: ['@ckeditor/ckeditor5-watchdog', '@ckeditor/ckeditor5-react'],
  },
})
