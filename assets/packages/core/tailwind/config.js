import path from 'path';
import { encodeBase64 } from '@std/encoding/base64';

export async function loadConfig(configPath, volume = {}) {
    if (configPath.startsWith('http')) {
        return importCdnModule(configPath);
    } else if (configPath.startsWith('./')) {
        return importLocalModule(configPath, volume);
    }

    throw new Error(`Loading the config file "${configPath}" is not supported.`);
}

async function importCdnModule(path) {
    return await import(/* @vite-ignore */ path).then((m) => m.default ?? m);
}

async function importLocalModule(configPath, volume = {}) {
    // relative path as absolute path
    if (configPath.startsWith('./')) {
        configPath = path.resolve(
            '/',
            configPath
        );
    }

    // volume are key-value pairs (relative_path: content).
    const configContent = volume[configPath];

    if (!configContent) {
        throw new Error(`The config file "${configPath}" does not exist in the volume.`);
    }

    // import the module from the content
    return await import(/* @vite-ignore */ `data:text/javascript;base64,${encodeBase64(configContent)}`).then((m) => m.default ?? m);
}