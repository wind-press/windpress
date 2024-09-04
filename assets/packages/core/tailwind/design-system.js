import { __unstable__loadDesignSystem } from '@tailwindcss/root/packages/tailwindcss/src';
import { loadPlugin } from './plugin';

export async function loadDesignSystem(css, opts = {}) {
    return __unstable__loadDesignSystem(css, {
        ...opts,
        loadPlugin
    });
}