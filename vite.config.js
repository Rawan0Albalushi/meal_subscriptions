import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.jsx'],
            refresh: true,
        }),
        react(),
        tailwindcss(),
    ],
    server: {
        host: '127.0.0.1',
        port: 5173,
        hmr: {
            host: '127.0.0.1'
        },
        strictPort: true,
        origin: 'http://127.0.0.1:5173'
    },
    optimizeDeps: {
        include: ['leaflet']
    },
    build: {
        rollupOptions: {
            external: ['leaflet']
        }
    }
});
