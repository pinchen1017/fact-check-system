import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/',
  plugins: [react()],
  build: {
    sourcemap: false,
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  },
  server: {
    port: 5173,
    host: '0.0.0.0',

    // ★★★★★ 這是關鍵！Vite 7 新增安全限制 ★★★★★
    allowedHosts: [
      "corolitic-anabelle-imperturbably.ngrok-free.dev",
      "*.ngrok-free.dev",
      "*.ngrok.io"
    ],

    proxy: {
      '/local-api': {
        target: 'http://127.0.0.1:4000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/local-api/, ''),
      },
      '/api-proxy': {
        target: 'http://120.107.172.114:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-proxy/, ''),
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        },
      }
    }
  },
  preview: {
    port: 4173,
    host: '0.0.0.0'
  }
})