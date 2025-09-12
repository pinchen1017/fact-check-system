import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default { 
  base: '/echo_debate_of_school_project/' , //  倉庫名
  plugins: [react()],
}
// export default defineConfig({
//   plugins: [react()], 
// })
