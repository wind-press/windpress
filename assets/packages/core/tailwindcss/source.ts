import { find_tw_candidates } from '@windpress/oxide-parser-wasm';
import { minimatch } from 'minimatch';
import { createLogComposable } from '@/dashboard/stores/log'
import { useApi } from '@/dashboard/library/api';

export type Glob = {
    pattern: string;
    base: string;
};

export async function loadSource(globs: Glob[]) {
    const logStore = createLogComposable();

    let contents: string[] = [];

    const promises = globs.map(async (glob) => {
        let logId;
        if (glob.pattern.startsWith('jsdelivr:')) {
            logId = logStore.add({ message: `Loading source: jsDelivr (${glob.pattern})`, type: 'info', group: 'source' });
            contents.push(...await jsDelivrProvider(glob));
        } else if (glob.pattern.startsWith('http')) {
            logId = logStore.add({ message: `Loading source: Network (${glob.pattern})`, type: 'info', group: 'source' });
            contents.push(...await httpFileProvider(glob));
        } else if (glob.pattern.startsWith('wp-content:')) {
            logId = logStore.add({ message: `Loading source: WP Content (${glob.pattern})`, type: 'info', group: 'source' });
            contents.push(...await wpContentProvider(glob));
        }

        if (logId) {
            let currentLog = logStore.logs.value.find((log) => log.id === logId);

            if (currentLog) {
                currentLog.message += ' - done';
            }
        }
    });

    await Promise.all(promises);

    const candidates_pool: string[] = [];

    let logId = logStore.add({ message: 'Scanning sources...', type: 'info', group: 'source' });

    contents.forEach((content) => {
        const candidates = find_tw_candidates(content);

        candidates_pool.push(...candidates);
    });

    let currentLog = logStore.logs.value.find((log) => log.id === logId);

    if (currentLog) {
        currentLog.message += ' - done';
    }

    return Array.from(new Set(candidates_pool));
}

async function jsDelivrProvider(glob: Glob) {
    const contents_pool: string[] = [];

    // get the path without `jsdelivr:` prefix
    let sourcePath = glob.pattern.slice(String('jsdelivr:').length);

    let [packageNameVersion, ...pathPatternArray] = sourcePath.split('/');
    let pathPattern = '/' + pathPatternArray.join('/');

    /**
     * Get files list from jsDelivr API and filter by path pattern
     * @see https://www.jsdelivr.com/docs/data.jsdelivr.com#get-/v1/packages/npm/-package-@-version-
     */

    let files: string[] = await fetch(`https://data.jsdelivr.com/v1/packages/npm/${packageNameVersion}?structure=flat`)
        .then((response) => response.json())
        .then((data) => data.files)
        .then((files: { name: string }[]) => files.map((file) => file.name))
        .then((files) => files.filter((file) => minimatch(file, pathPattern)));

    const promises = files.map(async (file) => {
        let content = await fetch(`https://cdn.jsdelivr.net/npm/${packageNameVersion}${file}`)
            .then((response) => response.text());

        contents_pool.push(content);
    });

    await Promise.all(promises);

    return contents_pool;
}

async function httpFileProvider(glob: Glob) {
    let content = await fetch(glob.pattern)
        .then((response) => response.text());

    return [content];
}

async function wpContentProvider(glob: Glob) {
    let sourcePath = glob.pattern.slice(String('wp-content:').length);

    const scan = await useApi()
        .post('admin/local-file-provider/scan', {
            path: sourcePath,
        })
        .then((resp) => resp.data);

    return scan.contents.map((c: { content: string }) => c.content);
}