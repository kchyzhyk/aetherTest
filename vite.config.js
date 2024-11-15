import { defineConfig } from 'vite';

export default defineConfig({
    base: '/aetherTest/',
    build: {
        rollupOptions: {
            external: ['three'],
        },
    },
    resolve: {
        alias: {

            'three': 'node_modules/three/build/three.module.js',
        },
    },
    server: {

        proxy: {

        },
    },
});
