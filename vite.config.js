import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    // Base path pour Electron (fichiers locaux)
    base: './',
    build: {
        outDir: 'dist',
        // Assurer la compatibilité avec Electron
        target: 'esnext',
        minify: 'esbuild',
    },
    server: {
        port: 5173,
        strictPort: true,
    },
    // Optimisations pour Electron
    optimizeDeps: {
        exclude: ['electron']
    }
})
