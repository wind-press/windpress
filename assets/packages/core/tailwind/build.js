import { compile } from 'tailwindcss';
import { bundle } from './bundle.js';
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
export async function build(opts) {
    const bundleResult = await bundle({
        entrypoint: opts.entrypoint,
        volume: opts.volume
    });

    return (await compile(bundleResult.css)).build(opts.candidates);
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