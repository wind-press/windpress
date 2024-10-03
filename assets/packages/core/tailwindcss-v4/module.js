import path from 'path';
import { encodeBase64 } from '@std/encoding/base64';
import { isValidUrl } from './bundle';

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

export async function importCdnModule(path, base, resourceHint) {
    let module = await import(/* @vite-ignore */ path).then((m) => m.default ?? m);

    return module;
}

export async function importLocalModule(modulePath, base, resourceHint, volume = {}) {
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

    let _moduleContent = recursiveInlineImportModule(moduleContent, modulePath, volume);

    let module = await import(/* @vite-ignore */ `data:text/javascript;base64,${encodeBase64(_moduleContent)}`).then((m) => m.default ?? m);

    return module;
}

function recursiveInlineImportModule(moduleContent, currentPath, volume = {}) {
    let _moduleContent = moduleContent.replace(/import\s+['"](.+?)['"];/g, (match, importPath) => {
        let _importPath = importPath;

        // if the importPath is valid url, skip
        if (isValidUrl(_importPath)) {
            return match;
        }

        // resolve the path and check if the file is in the volume
        let _path = path.resolve(
            path.dirname(currentPath),
            _importPath
        );

        // volume are key-value pairs (relative_path: content).
        let _importModuleContent = volume[_path];

        if (!_importModuleContent) {
            throw new Error(`${currentPath}: The module file "${_path}" does not exist in the volume.`);
        }

        _importModuleContent = recursiveInlineImportModule(_importModuleContent, _path, volume);
        return `import /* @vite-ignore */ 'data:text/javascript;base64,${encodeBase64(_importModuleContent)}';`;
    });

    return _moduleContent;
}
