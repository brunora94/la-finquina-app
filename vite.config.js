import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'La Finquina Control',
        short_name: 'La Finquina',
        description: 'App de control integral para La Finquina',
        theme_color: '#ffffff',
        icons: []
      }
    })
  ],
})
