import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/echo_debate_of_school_project/',
  plugins: [react()],
  build: {
    sourcemap: true
  }
})
