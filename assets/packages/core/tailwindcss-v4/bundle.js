import path from 'path'
import postcss from 'postcss';
import postcssImport from 'postcss-import';
import postcssNested from 'postcss-nested';
import twTheme from '@tailwindcss/root/packages/tailwindcss/theme.css?inline';
import twPreflight from '@tailwindcss/root/packages/tailwindcss/preflight.css?inline';
import twUtilities from '@tailwindcss/root/packages/tailwindcss/utilities.css?inline';
import twIndex from '@tailwindcss/root/packages/tailwindcss/index.css?inline';
import { decodeBase64 } from '@std/encoding/base64';

const twVolume = {
    '/tailwindcss/index.css': twIndex,
    '/tailwindcss/theme.css': twTheme,
    '/tailwindcss/preflight.css': twPreflight,
    '/tailwindcss/utilities.css': twUtilities
};

export function isValidUrl(url) {
    try {
        const resource = new URL(url);

        return resource.protocol === 'http:' || resource.protocol === 'https:';
    } catch (e) {
        return false;
    }
}

export async function bundle(opts) {
    const volume = {
        ...opts.volume,
        ...twVolume
    };

    const processor = postcss()
        .use(
            postcssImport({
                filter: () => true,
                async resolve(id, basedir) {
                    if (isValidUrl(id)) {
                        return new URL(id).toString()
                    } else {
                        // Volume: resolve relative path as absolute path
                        if (id.startsWith('.')) {
                            id = path.resolve(path.dirname(basedir), id);

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
                        let _path = path.resolve(basedir, id);

                        if (volume[_path]) {
                            return _path;
                        }

                        /*
                         * Resolve default import if no extension is specified
                         * */
                        if (!id.endsWith('.css')) {
                            id = id.concat('/index.css')
                        }

                        _path = path.join(basedir, id);

                        if (volume[_path]) {
                            return _path;
                        }

                        // CDN

                        // fetch and store in volume
                        await fetch(`https://esm.sh${_path}`)
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

                        return _path;
                    }
                },
                load(file) {
                    if (isValidUrl(file)) {
                        return fetch(file).then((response) => response.text());
                    }

                    if (volume[file]) {
                        return volume[file];
                    }
                }
            })
        )
        .use(postcssNested());

    const result = await processor.process(volume[opts.entrypoint], {
        from: opts.entrypoint
    });

    return {
        css: result.css
    };
}

export function decodeVFSContainer(vfsContainer) {
    return JSON.parse(new TextDecoder().decode(decodeBase64(vfsContainer)));
}