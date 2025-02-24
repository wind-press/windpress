import path from 'path';
import twTheme from '@tailwindcss/root/packages/tailwindcss/theme.css?inline';
import twPreflight from '@tailwindcss/root/packages/tailwindcss/preflight.css?inline';
import twUtilities from '@tailwindcss/root/packages/tailwindcss/utilities.css?inline';
import twIndex from '@tailwindcss/root/packages/tailwindcss/index.css?inline';
import { isValidUrl } from './utils';

const twVolume = {
    '/tailwindcss/index.css': twIndex,
    '/tailwindcss/theme.css': twTheme,
    '/tailwindcss/preflight.css': twPreflight,
    '/tailwindcss/utilities.css': twUtilities
};

async function httpsProvider(url) {
    return await fetch(url).then((res) => res.text());
}

export async function loadStylesheet(id, base = '/', volume = {}) {
    base = base || '/';

    volume = {
        ...volume,
        ...twVolume
    };

    let _id = id;

    if (isValidUrl(id)) {
        return {
            base: path.dirname(id),
            content: await httpsProvider(new URL(id).toString())
        }

    } else {
        // Volume: resolve relative path as absolute path
        if (id.startsWith('.')) {
            id = path.resolve(path.dirname(base), id);

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
                } else {
                    id = id.concat('/index.css')
                }
            }
        }

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
        let _url = new URL(id, 'https://esm.sh');
        _path = _url.pathname;

        if (!_path.endsWith('.css')) {
            _path = _path.concat('/index.css')
        }

        _path = path.join(base, _path);

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
        await fetch(`https://esm.sh${_path}`)
            .then(async (response) => {
                if (!response.ok) {
                    throw new Error(
                        _id.startsWith('.')
                            ? `Cannot find stylesheet '${_id}' on the Simple File System`
                            : `Cannot find stylesheet '${_id}' on the CDN`
                    );
                }

                let data = await response.text();

                data = data
                    // resolve the `@config '|"` imports paths to absolute paths with cdn
                    .replace(/@config\s+['|"](.*)['|"]/g, (match, p1) => {
                        return `@config 'https://esm.sh${path.resolve(path.dirname(id))}${path.resolve(p1)}'`;
                    })
                    // resolve the `@plugin '|"` imports paths to absolute paths with cdn
                    .replace(/@plugin\s+['|"](.*)['|"]/g, (match, p1) => {
                        return `@plugin 'https://esm.sh${path.resolve(path.dirname(id))}${path.resolve(p1)}'`;
                    });

                volume[_path] = data;
            });

        return {
            base: path.dirname(id),
            content: volume[_path]
        }
    }
}