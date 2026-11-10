import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/predict': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/history': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/advisory': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})
