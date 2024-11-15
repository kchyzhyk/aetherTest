
export default {
    base: '/aetherTest/',
    build: {
        outDir: 'dist',
        rollupOptions: {
            external: ['three'],
        },
    }
};