import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5179, // On change complètement de port pour éviter le processus planté !
    host: true, // Permet d'exposer l'application sur le réseau local ou via un tunnel
    strictPort: true, // Force l'erreur si le port 5173 est pris au lieu de passer au 5174 en cachette !
    allowedHosts: true, // Autorise toutes les URLs entrantes (indispensable pour les tunnels Cloudflare/Ngrok qui changent souvent)
    hmr: {
      // clientPort: 443, // Commenté pour fonctionner aussi bien sur localhost que sur le tunnel (Vite utilisera le port de l'URL courante)
    },
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
      },
      '/labels': {
        target: 'http://localhost:8090',
        changeOrigin: true,
      },
      '^/invoice/.*': {
        target: 'http://localhost:8090',
        changeOrigin: true,
      },
      '/pdf': {
        target: 'http://localhost:8090/invoice',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/pdf/, '')
      }
    }
  }
})
