import { __unstable__loadDesignSystem } from 'tailwindcss';
import { loadModule } from './module';
import { loadStylesheet } from './stylesheet';

export async function loadDesignSystem({ entrypoint = '/main.css', volume = {}, ...opts } = {}) {
    opts = { entrypoint, volume, ...opts };

    return __unstable__loadDesignSystem(opts.volume[opts.entrypoint], {
        ...opts,
        loadModule: async (modulePath, base, resourceHint) => loadModule(modulePath, base, resourceHint, opts.volume),
        loadStylesheet: async (id, base) => loadStylesheet(id, base, opts.volume)
    });
}