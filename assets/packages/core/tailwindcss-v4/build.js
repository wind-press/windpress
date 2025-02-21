import { compile as _compile } from '@tailwindcss/root/packages/tailwindcss/src';
import { loadModule } from './module.js';
import lightningcssWasmFile from '~/node_modules/lightningcss-wasm/lightningcss_node.wasm?url';
import init, { Features, transform } from 'lightningcss-wasm';
import { loadStylesheet } from './stylesheet.js';

/**
 * Build the CSS
 *
 * @param {object} opts
 * @param {Array<string>} opts.candidates
 * @param {string} opts.entrypoint
 * @param {Record<string, string>} opts.volume
 * @returns {Promise<string>}
 */
export async function build({ candidates = [], entrypoint = '/main.css', volume = {}, ...opts } = {}) {
    let compiled = await compile({ candidates, entrypoint, volume, ...opts });
    return compiled.build(candidates);
}

export async function compile({ candidates = [], entrypoint = '/main.css', volume = {}, ...opts } = {}) {
    opts = { candidates, entrypoint, volume, ...opts };

    return await _compile(opts.volume[opts.entrypoint], {
        loadModule: async (modulePath, base, resourceHint) => loadModule(modulePath, base, resourceHint, opts.volume),
        loadStylesheet: async (id, base) => loadStylesheet(id, base, opts.volume)
    });
}

/**
 * Optimize the CSS
 *
 * @param {string} css
 * @param {boolean} minify Default is `false`. Whether to minify the CSS.
 */
export async function optimize(css, minify = false) {
    await init(lightningcssWasmFile);

    const result = transform({
        filename: 'main.css',
        code: new TextEncoder().encode(css),
        minify,
        sourceMap: false,
        drafts: {
            customMedia: true,
        },
        nonStandard: {
            deepSelectorCombinator: true,
        },
        include: Features.Nesting,
        exclude: Features.LogicalProperties | Features.DirSelector | Features.LightDark,
        targets: {
            safari: (16 << 16) | (4 << 8),
            ios_saf: (16 << 16) | (4 << 8),
            firefox: 128 << 16,
            chrome: 111 << 16,
        },
        errorRecovery: true,
    });

    return {
        code: result.code,
        css: new TextDecoder().decode(result.code),
        warnings: result.warnings
    };
}