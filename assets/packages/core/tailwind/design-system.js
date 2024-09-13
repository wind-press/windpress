import { __unstable__loadDesignSystem } from '@tailwindcss/root/packages/tailwindcss/src';
import { loadPlugin } from './plugin';
import { loadConfig } from './config';
import { bundle } from './bundle';

export async function loadDesignSystem({ entrypoint = '/main.css', volume = {}, ...opts } = {}) {
    opts = { entrypoint, volume, ...opts };  

    const bundleResult = await bundle({
        entrypoint: opts.entrypoint,
        volume: opts.volume
    });

    return __unstable__loadDesignSystem(bundleResult.css, {
        ...opts,
        loadPlugin,
        loadConfig: async (configPath) => loadConfig(configPath, opts.volume)
    });
}