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

export async function loadStylesheet(id, base, volume = {}) {
    volume = {
        ...volume,
        ...twVolume
    };

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
         * */
        if (!id.endsWith('.css')) {
            id = id.concat('/index.css')
        }

        _path = path.join(base, id);

        if (volume[_path]) {
            return {
                base: path.dirname(id),
                content: volume[_path]
            }
        }

        // CDN

        // fetch and store in volume
        await fetch(`https://esm.sh/${_path}`)
            .then((response) => response.text())
            .then((data) => {
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