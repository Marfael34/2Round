import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true, // Permet d'exposer l'application sur le réseau local ou via un tunnel
    allowedHosts: true, // Autorise toutes les URLs entrantes (indispensable pour les tunnels Cloudflare/Ngrok qui changent souvent)
    // Décommente et adapte ceci quand ton frontend appellera l'API
    proxy: {
      '/api': {
        target: 'http://localhost:8090',
        changeOrigin: true,
      },
      '/images': {
        target: 'http://localhost:8090',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:8090',
        changeOrigin: true,
      }
    }
  }
})
