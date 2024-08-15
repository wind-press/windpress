import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { v4wp } from '@kucrut/vite-for-wp';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import wasm from 'vite-plugin-wasm';
import topLevelAwait from "vite-plugin-top-level-await";
import path from 'path';

export default defineConfig({
    plugins: [
        wasm(),
        topLevelAwait(),
        nodePolyfills({
            // Override the default polyfills for specific modules.
            overrides: {
                // Since `fs` is not supported in browsers, we can use the `memfs` package to polyfill it.
                fs: 'memfs',
            },
        }),
        v4wp({
            input: {
                dashboard: 'assets/apps/dashboard/main.js',

                // Tailwind
                'packages/core/tailwind/play/observer': 'assets/packages/core/tailwind/play/observer.js',
                'packages/core/tailwind/play/autocomplete': 'assets/packages/core/tailwind/play/autocomplete.js',
                'packages/core/tailwind/play/sort': 'assets/packages/core/tailwind/play/sort.js',
                'packages/core/tailwind/play/classname-to-css': 'assets/packages/core/tailwind/play/classname-to-css.js',

                // Integrations
                'integration/bricks': 'assets/integration/bricks/main.js',
                'integration/breakdance': 'assets/integration/breakdance/main.js',
                'integration/oxygen/iframe': 'assets/integration/oxygen/iframe/main.js',
                'integration/oxygen/editor': 'assets/integration/oxygen/editor/main.js',
                'integration/gutenberg/post-editor': 'assets/integration/gutenberg/post-editor.js',
                'integration/livecanvas': 'assets/integration/livecanvas/main.js',
                'integration/builderius': 'assets/integration/builderius/main.js',
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
        target: 'modules',
    },
    publicDir: 'assets/static',
    resolve: {
        alias: {
            '~': path.resolve(__dirname), // root directory
            '@/dashboard': path.resolve(__dirname, './assets/apps/dashboard'),
            '@/integration': path.resolve(__dirname, './assets/integration'),
            '@/common': path.resolve(__dirname, './assets/common'),
            '@/packages': path.resolve(__dirname, './assets/packages'),
        },
    },
});