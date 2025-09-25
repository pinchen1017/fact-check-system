import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/',
  plugins: [react()],
  build: {
    sourcemap: true,
    outDir: 'dist'
  },
  server: {
    port: 5173,
    host: true
  }
})
