/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { readFileSync } from 'node:fs'
import { defineConfig } from 'vite'

const { version } = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')) as { version: string }

export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    // Versi aplikasi dari package.json dan commit yang di-build (COMMIT_REF disediakan Netlify).
    __APP_VERSION__: JSON.stringify(version),
    __COMMIT_REF__: JSON.stringify(process.env.COMMIT_REF ?? ''),
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    globals: true,
    css: false,
  },
})
