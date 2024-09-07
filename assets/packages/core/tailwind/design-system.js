import { __unstable__loadDesignSystem } from '@tailwindcss/root/packages/tailwindcss/src';
import { loadPlugin } from './plugin';
import { bundle } from './bundle';

export async function loadDesignSystem(css, opts = {}) {
    const bundleResult = await bundle({
        entrypoint: '/main.css',
        volume: {
            '/main.css': css,
        }
    });

    return __unstable__loadDesignSystem(bundleResult.css, {
        ...opts,
        loadPlugin
    });
}