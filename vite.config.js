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
    // Base path par défaut pour Vercel
    base: '/',
    build: {
        outDir: 'dist',
        target: 'esnext',
        minify: 'esbuild',
    },
    server: {
        port: 5173,
        strictPort: true,
    },
    optimizeDeps: {
        exclude: ['electron']
    }
})
