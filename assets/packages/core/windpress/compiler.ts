import { encodeBase64 } from '@std/encoding/base64';
import { unescape } from "@std/html/entities";
import { createLogComposable } from '@/dashboard/stores/log'
import { useApi } from '@/dashboard/library/api';
import { stringify as stringifyYaml } from 'yaml';
import { compile as buildV4, find_tw_candidates, optimize as optimizeV4, loadSource } from '@/packages/core/tailwindcss';
import { build as buildV3, optimize as optimizeV3 } from '@/packages/core/tailwindcss-v3';
import { nanoid } from 'nanoid';
import lzString from 'lz-string';
import { get } from 'lodash-es';

// TODO: Add option to allow enable/disable the incremental cache build

export type Provider = {
    callback?: string;
    description?: string;
    enabled: boolean;
    id: string;
    name: string;
}

export type CSS_Cache = {
    last_generated: number | null;
    last_full_build: number | null;
    file_url: string | null;
    file_size: number | null;
};

export type BuildCacheOptions = {
    // Should the cache be stored on the server?
    store?: boolean;

    // The Tailwind CSS version to use. If not set, it will be pulled from the server, if failed, it will default to 4
    tailwindcss_version?: 3 | 4;

    // Full or incremental cache build. "Full" will scan all providers, while "Incremental" will use the stored sources on the browser's local storage (if available)
    kind?: 'full' | 'incremental';

    // The sources to use for the incremental cache build. By default, the sources will be pulled from the browser's local storage
    incremental?: {
        // The providers that the sources should be pulled from the server
        providers?: string[];

        // The sources to use for the incremental cache build. Use this to include extra sources that are not part of the providers
        sources?: string[];
    };
}

export async function buildCache(opts: BuildCacheOptions = {}) {
    const api = useApi();
    const log = createLogComposable();

    log.add({ message: 'Starting cache build...', type: 'info' });

    const options: BuildCacheOptions = Object.assign({
        store: true,
        kind: 'full',
    }, opts);

    let providers: Provider[] = [];
    let volume: { [key: string]: string; } = {};

    let css_cache: CSS_Cache = {
        last_generated: null,
        last_full_build: null,
        file_url: null,
        file_size: 0,
    };

    log.add({ message: 'Getting the latest Simple File System data...', type: 'info' });

    await api
        .get('admin/settings/cache/providers')
        .then((resp) => {
            providers = resp.data.providers;
        });

    await api
        .get('admin/settings/cache/index')
        .then((resp: { data: { cache: CSS_Cache } }) => {
            css_cache = resp.data.cache;
        });

    await api
        .request('/admin/volume/index', { method: 'GET' })
        .then(response => response.data)
        .then(res => {
            volume = res.entries.reduce((acc: { [key: string]: string }, entry) => {
                acc[`/${entry.relative_path}`] = entry.content;
                return acc;
            }, {});
        })

    // if version is not set, get the setting from the server
    if (!options.tailwindcss_version) {
        await api
            .request('/admin/settings/options/index', { method: 'GET', })
            .then((response) => {
                const version = Number(get(response.data.options, 'general.tailwindcss.version', 4));
                if (version === 3 || version === 4) {
                    options.tailwindcss_version = version;
                } else {
                    options.tailwindcss_version = 4;
                }
            })
    }

    if (providers.length === 0 || providers.filter(provider => provider.enabled).length === 0) {
        log.add({ message: 'No cache provider found', type: 'error' });

        throw new Error('No cache provider found');
    }

    let content_pool: Array<{ content: string; type: string }> = [];

    // Helper function to handle batch processing for a single provider
    async function fetchProviderContents(provider: Provider) {
        let batch = false as boolean | string;
        let batch_pool: Array<{ content: string; type: string }> = [];

        // check if kind is set and is incremental
        if (options.kind === 'incremental') {
            // check if the provider's id is not in the incremental providers list
            if (options.incremental?.providers && !options.incremental.providers.includes(provider.id)) {
                // use the stored sources on the browser's local storage (if available)
                let lsCache = localStorage.getItem(`windpress.cache.provider.${provider.id}`);

                if (lsCache) {
                    let decompressedCache = lzString.decompressFromUTF16(lsCache);
                    let cache = decompressedCache ? JSON.parse(decompressedCache) : null;

                    if (cache && !(css_cache.last_full_build !== null && Number(cache.timestamp) < Number(css_cache.last_full_build))) {
                        content_pool.push(...cache.contents);

                        log.add({ message: `Using cached sources for provider: ${provider.name}`, type: 'info' });

                        return Promise.resolve();
                    }
                }
            }
        }

        try {
            do {
                let logId = nanoid(10);
                let logMessage = `Scanning provider: ${provider.name}... (${batch !== false ? batch : 'initial'})`;

                log.add({ message: logMessage, type: 'info', id: logId });

                const scan: { contents: Array<{ content: string; type: string }>, metadata?: { next_batch?: boolean | string } } = await api
                    .post('admin/settings/cache/providers/scan', {
                        provider_id: provider.id,
                        metadata: { next_batch: batch },
                    })
                    .then((resp) => resp.data)
                    .catch((error) => {
                        log.update(logId, { type: 'error', message: `${logMessage} - failed: ${error.statusText} -> ${error.data.message}` });
                        // throw the error to stop the process
                        throw error;
                    });

                batch_pool.push(...scan.contents);

                batch = scan.metadata?.next_batch || false;

                log.update(logId, { type: 'info', message: `${logMessage} - done` });
            } while (batch !== false);
        } catch (error) {
            log.add({ message: 'Canceling cache build...', type: 'info' });
            throw error;
        }

        content_pool.push(...batch_pool);

        // store to local storage
        localStorage.setItem(`windpress.cache.provider.${provider.id}`, lzString.compressToUTF16(JSON.stringify({ contents: batch_pool, timestamp: Date.now() })));

        return Promise.resolve();
    }

    const promises = providers.filter(provider => provider.enabled)
        .map(provider => fetchProviderContents(provider));

    await Promise.all(promises);

    const contents = content_pool.map((c) => {
        let content = atob(c.content);

        if (c.type === 'json') {
            content = stringifyYaml(JSON.parse(content));
        }

        return unescape(content);
    });

    let normal = null;
    let minified = null;

    if (options.tailwindcss_version === 4) {
        const candidates_pool: string[] = [];

        contents.forEach((content) => {
            const candidates = find_tw_candidates(content);

            candidates_pool.push(...candidates);
        });

        const compiled = await buildV4({
            entrypoint: '/main.css',
            volume,
        });

        // convert to set to remove duplicates, then back to array
        let candidates = [...new Set([...candidates_pool, ...await loadSource(compiled.globs)])];

        log.add({ message: 'Scanning complete', type: 'success' });
        log.add({ message: 'Building cache...', type: 'info' });

        const result = compiled.build(candidates);

        normal = (await optimizeV4({ css: result })).css;
        minified = (await optimizeV4({ css: result, minify: true })).css;
    } else if (options.tailwindcss_version === 3) {
        log.add({ message: 'Scanning complete', type: 'success' });
        log.add({ message: 'Building cache...', type: 'info' });

        const result = await buildV3({
            entrypoint: {
                css: '/main.css',
                config: '/tailwind.config.js',
            },
            contents,
            volume,
        });

        normal = (await optimizeV3(result)).css;
        minified = (await optimizeV3(result, true)).css;
    }

    log.add({ message: 'Cache built', type: 'success' });

    css_cache.last_generated = Date.now();
    css_cache.last_full_build = options.kind === 'full' ? Date.now() : css_cache.last_full_build;

    // store to server?
    if (options.store === true) {
        await api
            .post('admin/settings/cache/store', {
                // @see https://developer.mozilla.org/en-US/docs/Glossary/Base64#the_unicode_problem
                content: encodeBase64(minified || ''),
                full_build: options.kind === 'full' ? css_cache.last_full_build : null,
            })
            .then((resp) => {
                css_cache = resp.data.cache;
                log.add({ message: 'Cache stored', type: 'success' });
            });
    }

    return {
        normal: normal,
        minified: minified,
        css_cache: css_cache,
    };
}