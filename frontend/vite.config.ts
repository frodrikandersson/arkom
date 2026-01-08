import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Split React and React DOM into separate chunk
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // Split Stripe into separate chunk (only loaded when needed)
          'stripe-vendor': ['@stripe/stripe-js', '@stripe/react-stripe-js'],
        },
      },
    },
    // Increase chunk size warning limit since we're intentionally chunking
    chunkSizeWarningLimit: 600,
  },
})