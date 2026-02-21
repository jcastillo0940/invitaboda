import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/js/app.jsx'], // Verifica que esta ruta coincida con tu archivo
            refresh: true,
            publicDirectory: 'public_html', // <--- ESTO ES VITAL
        }),
        react(),
    ],
});