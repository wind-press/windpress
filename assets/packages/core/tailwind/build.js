import { compile } from '@tailwindcss/root/packages/tailwindcss/src';
import { bundle } from './bundle.js';
import { loadPlugin } from './plugin.js';
import { loadConfig } from './config.js';
import lightningcssWasmFile from '~/node_modules/lightningcss-wasm/lightningcss_node.wasm?url';
import init, { Features, transform } from 'lightningcss-wasm';

await init(lightningcssWasmFile);

/**
 * Build the CSS
 *
 * @param {object} opts
 * @param {Array<string>} opts.candidates
 * @param {string} opts.entrypoint
 * @param {Record<string, string>} opts.volume
 */
// export async function loadDesignSystem({ entrypoint = '/main.css', volume = {}, ...opts } = {}) {
// export async function build(opts = { candidates: [], entrypoint: '/main.css', volume: {}, ...opts }) {

export async function build({ candidates = [], entrypoint = '/main.css', volume = {}, ...opts } = {}) {
    opts = { candidates, entrypoint, volume, ...opts };  

    const bundleResult = await bundle({
        entrypoint: opts.entrypoint,
        volume: opts.volume
    });

    return (await compile(bundleResult.css, {
        loadPlugin,
        loadConfig: async (configPath) => loadConfig(configPath, opts.volume)
    })).build(opts.candidates);
}

/**
 * Optimize the CSS
 *
 * @param {string} css
 * @param {boolean} minify Default is `false`. Whether to minify the CSS.
 */
export async function optimize(css, minify = false) {
    const result = transform({
        filename: 'main.css',
        code: new TextEncoder().encode(css),
        minify,
        sourceMap: false,
        drafts: {
            customMedia: true
        },
        nonStandard: {
            deepSelectorCombinator: true
        },
        include: Features.Nesting,
        exclude: Features.LogicalProperties,
        targets: {
            safari: (16 << 16) | (4 << 8)
        },
        errorRecovery: true
    });

    return {
        code: result.code,
        css: new TextDecoder().decode(result.code),
        warnings: result.warnings
    };
}