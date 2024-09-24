import path from 'path';
import { encodeBase64 } from '@std/encoding/base64';

export async function loadModule(modulePath, base, resourceHint, volume = {}) {
    let module;    

    if (modulePath.startsWith('http')) {
        module = await importCdnModule(modulePath, base, resourceHint);
    } else if (modulePath.startsWith('./')) {
        module = await importLocalModule(modulePath, base, resourceHint, volume);
    }

    if (!module) {
        throw new Error(`The ${resourceHint} file "${modulePath}" is not a valid module.`);
    }

    return {
        module,
        base
    };

}

async function importCdnModule(path, base, resourceHint) {
    let module = await import(/* @vite-ignore */ path).then((m) => m.default ?? m);

    return module;
}

async function importLocalModule(modulePath, base, resourceHint, volume = {}) {
    // relative path as absolute path
    if (modulePath.startsWith('./')) {
        modulePath = path.resolve(
            '/',
            modulePath
        );
    }

    // volume are key-value pairs (relative_path: content).
    const moduleContent = volume[modulePath];

    if (!moduleContent) {
        throw new Error(`The ${resourceHint} file "${modulePath}" does not exist in the volume.`);
    }

    // import the module from the content
    let module = await import(/* @vite-ignore */ `data:text/javascript;base64,${encodeBase64(moduleContent)}`).then((m) => m.default ?? m);

    return module;
}