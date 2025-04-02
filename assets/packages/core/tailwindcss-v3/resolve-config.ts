import twResolveConfig from 'https://esm.sh/tailwindcss@3/src/public/resolve-config.js';
import { importLocalModule } from '@/packages/core/tailwindcss/module';

export async function resolveConfig(volume = {}, entrypoint = '/tailwind.config.js') {
    const importedConfig = await importLocalModule(entrypoint, undefined, 'config', volume);

    return twResolveConfig(importedConfig.module);
}