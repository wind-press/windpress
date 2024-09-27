import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import react from '@vitejs/plugin-react';
import { v4wp } from '@kucrut/vite-for-wp';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { wp_scripts } from '@kucrut/vite-for-wp/plugins';
import wasm from 'vite-plugin-wasm';
import topLevelAwait from 'vite-plugin-top-level-await';
import path from 'path';
import svgr from 'vite-plugin-svgr';

export default defineConfig({
    plugins: [
        wasm(),
        topLevelAwait(),
        nodePolyfills({
            // Override the default polyfills for specific modules.
            overrides: {
                fs: 'memfs', // Since `fs` is not supported in browsers, we can use the `memfs` package to polyfill it.
            },
        }),
        v4wp({
            input: {
                dashboard: 'assets/apps/dashboard/main.js',

                // Tailwind
                'packages/core/tailwind-v4/play/observer': 'assets/packages/core/tailwind-v4/play/observer.js',
                'packages/core/tailwind-v4/play/autocomplete': 'assets/packages/core/tailwind-v4/play/autocomplete.js',
                'packages/core/tailwind-v4/play/sort': 'assets/packages/core/tailwind-v4/play/sort.js',
                'packages/core/tailwind-v4/play/classname-to-css': 'assets/packages/core/tailwind-v4/play/classname-to-css.js',

                // Integrations
                'integration/bricks': 'assets/integration/bricks/main.js',
                'integration/breakdance': 'assets/integration/breakdance/main.js',
                'integration/oxygen/iframe': 'assets/integration/oxygen/iframe/main.js',
                'integration/oxygen/editor': 'assets/integration/oxygen/editor/main.js',
                'integration/gutenberg/post-editor': 'assets/integration/gutenberg/post-editor.js',
                'integration/gutenberg/site-editor': 'assets/integration/gutenberg/site-editor.js',
                'integration/gutenberg/block-editor': 'assets/integration/gutenberg/block-editor.jsx',
                'integration/livecanvas': 'assets/integration/livecanvas/main.js',
                'integration/builderius': 'assets/integration/builderius/main.js',
            },
            outDir: 'build',
        }),
        vue(),
        wp_scripts(),
        svgr({
            svgrOptions: {
                dimensions: false,
            }
        }),
        react({
            jsxRuntime: 'classic',
        }),
    ],
    build: {
        target: 'modules',
        sourcemap: false,
        rollupOptions: {
            output: {
                manualChunks: {
                    'monaco-editor': ['monaco-editor'],
                },
                chunkFileNames: (chunkInfo) => {
                    // add .min to the vendor module to exclude it from the `wp i18n make-pot` command.
                    // @see https://developer.wordpress.org/cli/commands/i18n/make-pot/
                    return chunkInfo.name !== 'plugin' && chunkInfo.moduleIds.some(id => id.includes('assets') && !id.includes('node_modules')) ? '[name]-[hash].js' : '[name]-[hash].min.js';
                },
            },
            plugins: [
                {
                    name: 'rename-workers',
                    generateBundle(_, bundle) {
                        // if the fila name is in the format of `*.worker-*.js` and doesn't have '.min.js`, rename it to `*.worker-*.min.js`
                        // @see https://developer.wordpress.org/cli/commands/i18n/make-pot/
                        const workerFiles = Object.keys(bundle).filter(file => file.includes('.worker-') && !file.includes('.min.js'));
                        workerFiles.forEach((file) => {
                            const newFileName = file.replace('.js', '.min.js');
                            bundle[newFileName] = { ...bundle[file], fileName: newFileName };
                            delete bundle[file];
                        });
                    }
                }
            ],
        },
    },
    css: {
        preprocessorOptions: {
            scss: {
                api: 'modern-compiler',
            },
        },
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