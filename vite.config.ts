import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/smartsfilter/',
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    proxy: {
      '/smartsfilter/api': {
        target: 'http://host.docker.internal:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/smartsfilter/, ''),
      }
    }
  }
})
