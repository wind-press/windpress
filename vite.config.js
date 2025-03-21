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
import Icons from 'unplugin-icons/vite';
import IconsResolver from 'unplugin-icons/resolver';
import httpsImports from 'vite-plugin-https-imports';
import viteUiPro from '@nuxt/ui-pro/vite';

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
                dashboard: 'assets/dashboard/main.ts',

                // Tailwind v4
                'packages/core/tailwindcss/play/observer': 'assets/packages/core/tailwindcss/play/observer.ts',
                'packages/core/tailwindcss/play/intellisense': 'assets/packages/core/tailwindcss/play/intellisense.ts',
                'packages/core/tailwindcss/play/worker': 'assets/packages/core/tailwindcss/play/worker.ts',

                // Tailwind v3
                'packages/core/tailwindcss-v3/play/observer': 'assets/packages/core/tailwindcss-v3/play/observer.ts',
                'packages/core/tailwindcss-v3/play/intellisense': 'assets/packages/core/tailwindcss-v3/play/intellisense.ts',

                // Integrations
                'integration/gutenberg/post-editor': 'assets/integration/gutenberg/post-editor.js',
                'integration/gutenberg/site-editor': 'assets/integration/gutenberg/site-editor.js',
                'integration/gutenberg/block-editor': 'assets/integration/gutenberg/block-editor.jsx',
                'integration/bricks': 'assets/integration/bricks/main.js',
                'integration/oxygen-classic/iframe': 'assets/integration/oxygen-classic/iframe/main.js',
                'integration/oxygen-classic/editor': 'assets/integration/oxygen-classic/editor/main.js',
                'integration/livecanvas': 'assets/integration/livecanvas/main.js',
                'integration/breakdance': 'assets/integration/breakdance/main.js',
                'integration/builderius': 'assets/integration/builderius/main.js',
            },
            outDir: 'build',
        }),
        vue(),
        react({
            // jsxRuntime: 'classic',
        }),
        wp_scripts(),
        viteUiPro({
            // license: process.env.NUXT_UI_PRO_LICENSE,
            components: {
                resolvers: [
                    IconsResolver(),
                ],

                // relative paths to the directory to search for components.
                dirs: 'assets/dashboard/components',

                // Allow subdirectories as namespace prefix for components.
                directoryAsNamespace: true,

                // Collapse same prefixes (camel-sensitive) of folders and components
                // to prevent duplication inside namespaced component name.
                // works when `directoryAsNamespace: true`
                collapseSamePrefixes: true,
            },
            ui: {
                colors: {
                    primary: 'indigo',
                    neutral: 'zinc'
                },
                commandPalette: {
                    slots: {
                        root: 'z-[10001]',
                    }
                }
            },

        }),
        Icons({ autoInstall: true, scale: 1 }),
        svgr({
            svgrOptions: {
                dimensions: false,
            }
        }),
        httpsImports.default({}, function resolver(matcher) {
            return (id, importer) => {
                if (matcher(id)) {
                    return id;
                }
                else if (matcher(importer) && !id.includes('vite-plugin-node-polyfills')) {
                    return new URL(id, importer).toString();
                }
                return undefined;
            };
        }),
    ],
    build: {
        // target: 'modules',
        sourcemap: false,
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
            '@': path.resolve(__dirname, './assets'),
        },
    },
    server: {
        cors: true,
    }
});