import { __unstable__loadDesignSystem } from 'tailwindcss';
import { loadModule } from './module';
import { loadStylesheet } from './stylesheet';
import { preprocess } from './pre-process';

import type { DesignSystem } from '@tailwindcss/root/packages/tailwindcss/src/design-system';
import type { VFSContainer } from './vfs';

export type LoadDesignSystemOptions = {
    entrypoint?: string;
    volume?: VFSContainer;
    [key: string]: any;
}


export async function loadDesignSystem({ entrypoint = '/main.css', volume = {} as VFSContainer, ...opts }: LoadDesignSystemOptions = {}): Promise<DesignSystem> {
    opts = { entrypoint, volume, ...opts };

    opts.volume[opts.entrypoint] = (await preprocess(opts)).css;

    // @ts-ignore
    return __unstable__loadDesignSystem(opts.volume[opts.entrypoint], {
        ...opts,
        loadModule: async (modulePath, base, resourceHint) => loadModule(modulePath, base, resourceHint, opts.volume),
        loadStylesheet: async (id, base) => loadStylesheet(id, base, opts.volume)
    });
}