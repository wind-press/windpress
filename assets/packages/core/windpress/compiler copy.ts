import { encodeBase64 } from '@std/encoding/base64';
import { unescape } from "@std/html/entities";
import { useVolumeStore } from '@/dashboard/stores/volume';
import { useLogStore } from '@/dashboard/stores/log';
import { useApi } from '@/dashboard/library/api';
import { stringify as stringifyYaml } from 'yaml';
import { compile as buildV4, find_tw_candidates, optimize as optimizeV4, loadSource } from '@/packages/core/tailwindcss';
import { build as buildV3, optimize as optimizeV3 } from '@/packages/core/tailwindcss-v3';

// TODO: use BroadcastChannel as the main communication, including: trigger, progress, logs, etc.

export type Provider = {
    callback?: string;
    description?: string;
    enabled: boolean;
    id: string;
    name: string;
}

export type BuildCacheOptions = {
    // Should the cache be stored on the server?
    store?: boolean;

    // The Tailwind CSS version to use
    tailwindcss_version?: 3 | 4;

    // Full or partial cache build. "Full" will scan all providers, while "Partial" will use the stored sources on the browser's local storage (if available)
    kind?: 'full' | 'partial';

    // The sources to use for the partial cache build. By default, the sources will be pulled from the browser's local storage
    partials?: {
        // The providers that the sources should be pulled from the server
        providers?: string[];

        // The sources to use for the partial cache build. Use this to include extra sources that are not part of the providers
        sources?: string[];
    };
}

export async function buildCache(opts: BuildCacheOptions = {}) {
    // const volumeStore = useVolumeStore();
    const logStore = useLogStore();
    const api = useApi();


    logStore.add({ message: 'Starting cache build...', type: 'info' });

    const options: BuildCacheOptions = Object.assign({
        store: true,
        tailwindcss_version: 4,
        kind: 'full',
    }, opts);

    let providers: Provider[] = [];

    logStore.add({ message: 'Getting the latest Simple File System data...', type: 'info' });
    await volumeStore.doPull();

    await api
        .get('admin/settings/cache/providers')
        .then((resp) => {
            providers = resp.data.providers;
        });

    if (providers.length === 0 || providers.filter(provider => provider.enabled).length === 0) {
        logStore.add({ message: 'No cache provider found', type: 'error' });

        throw new Error('No cache provider found');
    }

    let content_pool = [];

    // Helper function to handle batch processing for a single provider
    async function fetchProviderContents(provider: Provider) {
        let batch = false;

        do {
            let logId = logStore.add({
                message: `Scanning provider: ${provider.name}... (${batch !== false ? batch : 'initial'})`, type: 'info'
            });

            const scan = await api
                .post('admin/settings/cache/providers/scan', {
                    provider_id: provider.id,
                    metadata: { next_batch: batch },
                })
                .then((resp) => resp.data);

            content_pool.push(...scan.contents);

            batch = scan.metadata?.next_batch || false;

            let currentLog = logStore.logs.find((log) => log.id === logId);

            currentLog.message += ' - done';
        } while (batch !== false);

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
        const candidates_pool = [];

        contents.forEach((content) => {
            const candidates = find_tw_candidates(content);

            candidates_pool.push(...candidates);
        });

        const compiled = await buildV4({
            // candidates: candidates,
            entrypoint: '/main.css',
            volume: volumeStore.getKVEntries(),
        });

        // convert to set to remove duplicates, then back to array
        let candidates = [...new Set([...candidates_pool, ...await loadSource(compiled.globs)])];

        logStore.add({ message: 'Scanning complete', type: 'success' });

        logStore.add({ message: 'Building cache...', type: 'info' });

        const result = compiled.build(candidates);

        normal = (await optimizeV4({ css: result })).css;
        minified = (await optimizeV4({ css: result, minify: true })).css;
    } else if (options.tailwindcss_version === 3) {
        logStore.add({ message: 'Scanning complete', type: 'success' });
        logStore.add({ message: 'Building cache...', type: 'info' });

        const result = await buildV3({
            entrypoint: {
                css: '/main.css',
                config: '/tailwind.config.js',
            },
            contents,
            volume: volumeStore.getKVEntries(),
        });

        normal = (await optimizeV3(result)).css;
        minified = (await optimizeV3(result, true)).css;
    }

    logStore.add({ message: 'Cache built', type: 'success' });

    let css_cache = {
        last_generated: null,
        file_url: null,
        file_size: false,
    };

    // store to server?
    if (options.store === true) {
        await api
            .post('admin/settings/cache/store', {
                // @see https://developer.mozilla.org/en-US/docs/Glossary/Base64#the_unicode_problem
                content: encodeBase64(minified),
            })
            .then((resp) => {
                css_cache = resp.data.cache;
                logStore.add({ message: 'Cache stored', type: 'success' });
            });
    }

    return {
        normal: normal,
        minified: minified,
        css_cache: css_cache,
    };
}