import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { v4wp } from '@kucrut/vite-for-wp';

export default defineConfig({
    plugins: [
        v4wp({
            input: {
                admin: 'assets/admin/main.js',

                // Integrations
                // 'integration/bricks': 'assets/integration/bricks/main.js',
                // 'integration/oxygen/iframe': 'assets/integration/oxygen/iframe/main.js',
                // 'integration/oxygen/editor': 'assets/integration/oxygen/editor/main.js',

                // // Tailwind
                // 'integration/lib/compiler': 'assets/integration/common/compiler-bootstrap.js',
            },
            outDir: 'build',
        }),
        vue(),
        {
            name: 'override-config',
            config: () => ({
                build: {
                    // ensure that manifest.json is not in ".vite/" folder
                    manifest: 'manifest.json',

                    // disable sourcemap
                    sourcemap: false,
                },
            }),
        },
    ],
    css: {
        lightningcss: true,
    },
    build: {
        // target: 'esnext',
        target: 'modules',
    },
    publicDir: 'assets/static',
});