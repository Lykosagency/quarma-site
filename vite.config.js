import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react({
    jsxRuntime: 'classic' // Force le mode classique pour éviter l'erreur "jsx-runtime"
  })],
})