import { useTailwindStore } from '@/dashboard/stores/tailwind';
import { useLogStore } from '@/dashboard/stores/log';
import { useApi } from '@/dashboard/library/api';
import { stringify as stringifyYaml } from 'yaml';
import { build, find_tw_candidates, optimize } from '@/packages/core/tailwind';

const api = useApi();

export async function buildCache(opts) {
    const twStore = useTailwindStore();
    const logStore = useLogStore();

    const options = Object.assign({
        force_pull: false,
        store: true,
    }, opts);

    let providers = [];

    if (options.force_pull === true || twStore.data.main_css.init === null) {
        await twStore.doPull();
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
        let batch_count = 0;

        do {
            const scan = await api
                .post('admin/settings/cache/providers/scan', {
                    provider_id: provider.id,
                    metadata: { next_batch: batch },
                })
                .then((resp) => resp.data);

            content_pool.push(...scan.contents);

            batch = scan.metadata?.next_batch || false;

            if (batch !== false) {
                logStore.add({ message: `Scanning provider: ${provider.name}... (${batch_count})`, type: 'info' });
                batch_count++;
            } else {
                logStore.add({ message: `Scanning provider: ${provider.name}...`, type: 'info' });
            }
        } while (batch !== false);

        return Promise.resolve();
    }

    const promises = providers.filter(provider => provider.enabled)
        .map(provider => fetchProviderContents(provider));

    await Promise.all(promises);

    logStore.add({ message: 'Scanning complete', type: 'success' });

    const contents = content_pool.map((c) => {
        let content = atob(c.content);

        if (c.type === 'json') {
            content = stringifyYaml(JSON.parse(content));
        }

        return content;
    });

    logStore.add({ message: 'Building cache...', type: 'info' });

    const candidates_pool = [];

    contents.forEach((content) => {
        const candidates = find_tw_candidates(content);

        candidates_pool.push(...candidates);
    });

    // convert to set to remove duplicates, then back to array
    const candidates = Array.from(new Set(candidates_pool));

    const result = await build({
        candidates: candidates,
        entrypoint: '/main.css',
        volume: {
            '/main.css': twStore.data.main_css.current,
        }
    });

    const normal = await optimize(result);
    const minified = await optimize(result, true);

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
                content: btoa(String.fromCodePoint(...new TextEncoder().encode(minified.css))),
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
