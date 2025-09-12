import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/echo_debate_of_school_project/',  // 倉庫名，前后都要有斜线
  plugins: [react()],
  build: {
    sourcemap: true,  // 加這個方便你找出錯誤
  },
})

// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// // https://vite.dev/config/
// export default { 
//   base: '/echo_debate_of_school_project/' , //  倉庫名
//   plugins: [react()],
// }
// // export default defineConfig({
// //   plugins: [react()], 
// // })
