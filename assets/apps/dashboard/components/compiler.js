import { encodeBase64 } from '@std/encoding/base64';
import { unescape } from "@std/html/entities";
import { useVolumeStore } from '@/dashboard/stores/volume';
import { useLogStore } from '@/dashboard/stores/log';
import { useApi } from '@/dashboard/library/api';
import { stringify as stringifyYaml } from 'yaml';
import { compile as buildV4, find_tw_candidates, optimize as optimizeV4, loadSource } from '@/packages/core/tailwindcss-v4';
import { build as buildV3, optimize as optimizeV3 } from '@/packages/core/tailwindcss-v3';

const api = useApi();

export async function buildCache(opts) {
    const volumeStore = useVolumeStore();
    const logStore = useLogStore();

    logStore.add({ message: 'Starting cache build...', type: 'info' });

    const options = Object.assign({
        force_pull: false,
        store: true,
        tailwindcss_version: 4,
    }, opts);

    let providers = [];

    if (options.force_pull === true || volumeStore.data.entries.length === 0) {
        logStore.add({ message: 'Getting the latest Simple File System data...', type: 'info' });
        await volumeStore.doPull();
    }

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
    async function fetchProviderContents(provider) {
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

        normal = (await optimizeV4(result)).css;
        minified = (await optimizeV4(result, true)).css;
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
