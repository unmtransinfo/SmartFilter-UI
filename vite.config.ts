import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/smartsfilter/',
  plugins: [react()],
  build: {
    outDir: '../dist',     // <-- output relative to root
    emptyOutDir: true
  },
  server: {
    host: true,
    port: 3000
  }
})

