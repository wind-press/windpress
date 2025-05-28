import { compile as _compile } from 'tailwindcss';
import { loadModule } from './module';
import lightningcssWasmFile from '~/node_modules/lightningcss-wasm/lightningcss_node.wasm?url';
import init, { Features, transform } from 'lightningcss-wasm';
import { loadStylesheet } from './stylesheet';
import { preprocess } from './pre-process';
import MagicString from 'magic-string';
import remapping from '@ampproject/remapping';

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
    map?: string;
}

export type OptimizeResult = {
    code?: Uint8Array;
    css: string;
    warnings: any[];
    map?: string;
}

/**
 * Optimize the CSS
 * 
 * @link https://github.com/tailwindlabs/tailwindcss/blob/main/packages/%40tailwindcss-node/src/optimize.ts#L29
 */
export async function optimize({ css, minify = false, map }: OptimizeOptions): Promise<OptimizeResult> {
    await init(lightningcssWasmFile);

    // const result = transform({
    //     filename: 'main.css',
    //     code: new TextEncoder().encode(css),
    //     minify,
    //     sourceMap: typeof map !== 'undefined',
    //     inputSourceMap: map,
    //     drafts: {
    //         customMedia: true,
    //     },
    //     nonStandard: {
    //         deepSelectorCombinator: true,
    //     },
    //     include: Features.Nesting | Features.MediaQueries,
    //     exclude: Features.LogicalProperties | Features.DirSelector | Features.LightDark,
    //     targets: {
    //         safari: (16 << 16) | (4 << 8),
    //         ios_saf: (16 << 16) | (4 << 8),
    //         firefox: 128 << 16,
    //         chrome: 111 << 16,
    //     },
    // });

    // return {
    //     code: result.code,
    //     css: new TextDecoder().decode(result.code),
    //     warnings: result.warnings
    // };

    function optimize(code: string | Buffer | Uint8Array, map: string | undefined) {
        return transform({
            filename: 'main.css',
            code: typeof code === 'string' ? new TextEncoder().encode(code) : code,
            minify,
            sourceMap: typeof map !== 'undefined',
            inputSourceMap: map,
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
    let result = optimize(css, map)
    map = new TextDecoder().decode(result.map || new Uint8Array())

    result = optimize(result.code, map)
    map = new TextDecoder().decode(result.map || new Uint8Array())

    let code = new TextDecoder().decode(result.code)

    // Work around an issue where the media query range syntax transpilation
    // generates code that is invalid with `@media` queries level 3.
    let magic = new MagicString(code)
    magic.replaceAll('@media not (', '@media not all and (')

    // We have to use a source-map-preserving method of replacing the content
    // which requires the use of Magic String + remapping(…) to make sure
    // the resulting map is correct
    if (map !== undefined && magic.hasChanged()) {
        let magicMap = magic.generateMap({ source: 'original', hires: 'boundary' }).toString()

        let remapped = remapping([magicMap, map], () => null)

        map = remapped.toString()
    }

    code = magic.toString()

    return {
        css: code,
        warnings: result.warnings,
        map,
    };
}