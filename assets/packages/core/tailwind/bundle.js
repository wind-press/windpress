import path from 'path'
import postcss from 'postcss';
import postcssImport from 'postcss-import';
import postcssNested from 'postcss-nested';
import twTheme from 'tailwindcss/theme.css?inline';
import twPreflight from 'tailwindcss/preflight.css?inline';
import twUtilities from 'tailwindcss/utilities.css?inline';
import twIndex from 'tailwindcss/index.css?inline';

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
                resolve(specifier, originatingFile) {
                    if (isValidUrl(specifier)) {
                        return new URL(specifier).toString()
                    } else {
                        /*
                         * Resolve alias
                         * */
                        if (specifier.startsWith('@')) {
                            specifier = specifier.replace('@/', '')
                            originatingFile = '/'
                        }

                        /*
                         * Resolve default import if no extension is specified
                         * */
                        if (!specifier.endsWith('.css')) {
                            if (
                                Object.keys(volume).some((file) =>
                                    file.includes(specifier.concat('.css'))
                                )
                            ) {
                                specifier = specifier.concat('.css')
                            } else {
                                specifier = specifier.concat('/index.css')
                            }
                        }

                        return path.resolve(
                            originatingFile,
                            specifier
                        )
                    }
                },
                load(file) {
                    if (isValidUrl(file)) {
                        return fetch(file).then((response) => response.text())
                    } else {
                        return volume[file]
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