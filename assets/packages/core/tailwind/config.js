export async function loadConfig(configPath) {
    if (configPath.startsWith('http')) {
        return importCdnModule(configPath);
    }

    throw new Error('The `loadConfig` currently only supports loading configs from URLs.')
}

async function importCdnModule(path) {
    return await import(/* @vite-ignore */ path).then((m) => m.default ?? m);
}