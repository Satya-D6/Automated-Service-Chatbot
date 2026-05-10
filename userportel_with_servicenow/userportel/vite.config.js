import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/sn-api': {
        target: 'https://dev328681.service-now.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/sn-api/, ''),
        secure: true,
      },
    },
  },
})