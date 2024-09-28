import { __unstable__loadDesignSystem } from '@tailwindcss/root/packages/tailwindcss/src';
import { loadModule } from './module';
import { bundle } from './bundle';

export async function loadDesignSystem({ entrypoint = '/main.css', volume = {}, ...opts } = {}) {
    opts = { entrypoint, volume, ...opts };  

    const bundleResult = await bundle({
        entrypoint: opts.entrypoint,
        volume: opts.volume
    });

    return __unstable__loadDesignSystem(bundleResult.css, {
        ...opts,
        loadModule: async (modulePath, base, resourceHint) => loadModule(modulePath, base, resourceHint, opts.volume)
    });
}