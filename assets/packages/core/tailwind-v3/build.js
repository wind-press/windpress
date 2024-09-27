import lightningcssWasmFile from '~/node_modules/lightningcss-wasm/lightningcss_node.wasm?url';
import init, { transform, browserslistToTargets } from 'lightningcss-wasm';
import browserslist from 'browserslist';
import { compile } from './compile';

await init(lightningcssWasmFile);

/**
 * Build the CSS
 *
 * @param {object} opts
 * @param {Array<string>} opts.contents
 * @param {Record<string, string>} opts.entrypoint
 * @param {Record<string, string>} opts.volume
 */
export async function build({ contents = [], entrypoint = {}, volume = {}, ...opts } = {}) {
    opts = { contents, entrypoint, volume, ...opts };

    return await compile(opts);
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
        targets: browserslistToTargets(browserslist('defaults')),
        errorRecovery: true
    });

    return {
        code: result.code,
        css: new TextDecoder().decode(result.code),
        warnings: result.warnings
    };
}