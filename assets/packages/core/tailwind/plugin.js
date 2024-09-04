export async function loadPlugin(pluginPath) {
    if (pluginPath.startsWith('http')) {
        return importCdnModule(pluginPath);
    }

    throw new Error('The `loadPlugin` currently only supports loading plugins from URLs.')
}

async function importCdnModule(path) {
    return await import(/* @vite-ignore */ path).then((m) => m.default ?? m);
}