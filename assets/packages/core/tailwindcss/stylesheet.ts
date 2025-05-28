import path from 'path';
import twTheme from 'tailwindcss/theme.css?raw';
import twPreflight from 'tailwindcss/preflight.css?raw';
import twUtilities from 'tailwindcss/utilities.css?raw';
import twIndex from 'tailwindcss/index.css?raw';
import { isValidUrl } from './utils';

import type { VFSContainer } from './vfs'

const twVolume = {
    '/tailwindcss/index.css': twIndex,
    '/tailwindcss/theme.css': twTheme,
    '/tailwindcss/preflight.css': twPreflight,
    '/tailwindcss/utilities.css': twUtilities
};

async function httpsProvider(url: string): Promise<string> {
    return await fetch(url).then((res) => res.text());
}

export async function loadStylesheet(id: string, base = '/', volume = {} as VFSContainer): Promise<{ base: string, content: string }> {
    base = base || '/';

    const _id = id;

    if (id.startsWith('fetch:') && isValidUrl(id.substring(6))) {
        return {
            base: path.dirname(id),
            content: await httpsProvider(new URL(id.substring(6)).toString())
        }
    } else {
        // Volume: resolve relative path as absolute path
        if (id.startsWith('.')) {
            id = path.resolve(base, id);

            /*
             * Resolve default import if no extension is specified
             * */
            if (!id.endsWith('.css')) {
                if (
                    Object.keys(volume).some((file) =>
                        file.includes(id.concat('.css'))
                    )
                ) {
                    id = id.concat('.css')
                } else if (
                    Object.keys(volume).some((file) =>
                        file.includes(id.concat('/index.css'))
                    )
                ) {
                    id = id.concat('/index.css')
                }
            }
        }

        // Reserved id for bundled Tailwind CSS' path
        if (Object.keys(twVolume).includes(path.resolve(id))) {
            base = '/';
        }

        volume = {
            ...volume,
            ...twVolume
        };

        // check if the file is in the volume
        let _path = path.resolve(base, id);

        if (volume[_path]) {
            return {
                base: path.dirname(id),
                content: volume[_path]
            }
        }

        /*
         * Resolve default import if no extension is specified
         */

        // consider it's a path of URL
        const _url = new URL(id, 'https://esm.sh');
        _path = _url.pathname;

        // if (!_path.endsWith('.css')) {
        //     _path = _path.concat('/index.css')
        // }

        // if base starts with a slash, assume it's not from the CDN
        // if (base.startsWith('/')) {
        //     // remove the leading slash from base
        //     _path = path.join(base, _path);
        // }

        if (volume[_path]) {
            return {
                base: path.dirname(id),
                content: volume[_path]
            }
        }

        // CDN

        // join the _path with the search params if any
        _path = _path.concat(_url.search);

        // fetch and store in volume
        let fetchSuccess = false;
        let fetchError: Error | null = null;
        let fetchCurrPath = null;
        const tryPaths = [_path];

        if (!_path.endsWith('.css')) {
            tryPaths.push(_path + '.css');
            tryPaths.push(_path + '/index.css');
        }

        for (const tryPath of tryPaths) {
            try {
                fetchCurrPath = tryPath;
                const response = await fetch(`https://esm.sh${tryPath}`);
                if (!response.ok) {
                    throw new Error();
                }

                // Ensure the response is a CSS file
                const contentType = response.headers.get('content-type') || '';
                if (!contentType.includes('text/css')) {
                    throw new Error(`Response is not a CSS file: ${contentType}`);
                }

                let data = await response.text();

                data = data
                    // resolve the `@config '|"` imports paths to absolute paths with cdn
                    .replace(/@config\s+['|"](.*)['|"]/g, (_, p1) => {
                        return `@config 'https://esm.sh${path.resolve(path.dirname(id))}${path.resolve(p1)}'`;
                    })
                    // resolve the `@plugin '|"` imports paths to absolute paths with cdn
                    .replace(/@plugin\s+['|"](.*)['|"]/g, (_, p1) => {
                        return `@plugin 'https://esm.sh${path.resolve(path.dirname(id))}${path.resolve(p1)}'`;
                    });

                volume[tryPath] = data;
                _path = tryPath;
                fetchSuccess = true;
                break;
            } catch (err: any) {
                fetchError = err;
            }
        }

        if (fetchError) {
            if (fetchSuccess) {
                console.warn(`Warning: The stylesheet '${_id}' was successfully fetched from the CDN using fallback path '${fetchCurrPath}'.`);
            } else {
                throw new Error(
                    _id.startsWith('.')
                        ? `Cannot find stylesheet '${_id}' on the Simple File System`
                        : `Cannot find stylesheet '${_id}' on the CDN`
                );
            }
        }

        return {
            base: path.dirname(id),
            content: volume[_path]
        }
    }
}
