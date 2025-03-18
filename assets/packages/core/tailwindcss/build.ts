import { compile as _compile } from 'tailwindcss';
import { loadModule } from './module';
import lightningcssWasmFile from '~/node_modules/lightningcss-wasm/lightningcss_node.wasm?url';
import init, { Features, transform } from 'lightningcss-wasm';
import { loadStylesheet } from './stylesheet';
import { preprocess } from './pre-process';

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
    code: Uint8Array;
    css: string;
    warnings: any[];
}

/**
 * Optimize the CSS
 */
export async function optimize({ css, minify = false }: OptimizeOptions): Promise<OptimizeResult> {
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