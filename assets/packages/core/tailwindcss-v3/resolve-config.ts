import twResolveConfig from 'https://esm.sh/tailwindcss@3/src/public/resolve-config.js';
import { importLocalModule } from '@/packages/core/tailwindcss/module';

export async function resolveConfig(volume = {}) {
    const importedConfig = await importLocalModule('./tailwind.config.js', undefined, 'config', volume);

    return twResolveConfig(importedConfig.module);
}