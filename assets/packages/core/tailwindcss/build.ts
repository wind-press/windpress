import { compile as _compile } from 'tailwindcss';
import { loadModule } from './module';
import lightningcssWasmFile from '~/node_modules/lightningcss-wasm/lightningcss_node.wasm?url';
import init, { Features, transform } from 'lightningcss-wasm';
import { loadStylesheet } from './stylesheet';
import { preprocess } from './pre-process';
import MagicString from 'magic-string';

import type { LoadDesignSystemOptions } from './design-system'

export type BuildOptions = LoadDesignSystemOptions & {
    candidates?: string[];
}

export async function compile({ candidates = [], entrypoint = '/main.css', volume = {}, ...opts }: BuildOptions) {
    opts = { candidates, entrypoint, volume, ...opts };

    opts.volume[opts.entrypoint] = (await preprocess(opts)).css;

    return await _compile(opts.volume[opts.entrypoint], {
        loadModule: async (modulePath, base, resourceHint) => loadModule(modulePath, base, resourceHint, opts.volume),
        loadStylesheet: async (id, base) => loadStylesheet(id, base, opts.volume)
    });
}

/**
 * Build the CSS
 */
export async function build({ candidates = [], entrypoint = '/main.css', volume = {}, ...opts }: BuildOptions): Promise<string> {
    const compiled = await compile({ candidates, entrypoint, volume, ...opts });
    return compiled.build(candidates);
}

export type OptimizeOptions = {
    css: string;
    minify?: boolean;
}

export type OptimizeResult = {
    code?: Uint8Array;
    css: string;
    warnings: any[];
}

/**
 * Optimize the CSS
 * 
 * @link https://github.com/tailwindlabs/tailwindcss/blob/main/packages/%40tailwindcss-node/src/optimize.ts#L29
 */
export async function optimize({ css, minify = false }: OptimizeOptions): Promise<OptimizeResult> {
    await init(lightningcssWasmFile);

    function optimize(code: string | Buffer | Uint8Array) {
        return transform({
            filename: 'main.css',
            code: typeof code === 'string' ? new TextEncoder().encode(code) : code,
            minify,
            sourceMap: false,
            drafts: {
                customMedia: true,
            },
            nonStandard: {
                deepSelectorCombinator: true,
            },
            include: Features.Nesting | Features.MediaQueries,
            exclude: Features.LogicalProperties | Features.DirSelector | Features.LightDark,
            targets: {
                safari: (16 << 16) | (4 << 8),
                ios_saf: (16 << 16) | (4 << 8),
                firefox: 128 << 16,
                chrome: 111 << 16,
            },
        });
    }

    // Running Lightning CSS twice to ensure that adjacent rules are merged after
    // nesting is applied. This creates a more optimized output.
    let result = optimize(css)
    result = optimize(result.code)

    let code = new TextDecoder().decode(result.code)

    // Work around an issue where the media query range syntax transpilation
    // generates code that is invalid with `@media` queries level 3.
    let magic = new MagicString(code)
    magic.replaceAll('@media not (', '@media not all and (')

    code = magic.toString()

    return {
        css: code,
        warnings: result.warnings,
    };
}