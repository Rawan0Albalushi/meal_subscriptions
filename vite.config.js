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
        host: '192.168.100.105',
        port: 5173,
        hmr: {
            host: '192.168.100.105'
        },
        strictPort: true,
        origin: 'http://192.168.100.105:5173'
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
