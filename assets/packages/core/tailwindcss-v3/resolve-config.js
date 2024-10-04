import twResolveConfig from 'https://esm.sh/tailwindcss@3/src/public/resolve-config.js';
import { importLocalModule, prepareModuleContent } from '@/packages/core/tailwindcss-v4/module';

export async function resolveConfig(configStr, volume = {}) {
    configStr = prepareModuleContent(configStr);

    const importedConfig = await importLocalModule('./tailwind.config.js', null, 'config', {
        ...volume,
        '/tailwind.config.js': configStr
    });

    return twResolveConfig(importedConfig);
}
