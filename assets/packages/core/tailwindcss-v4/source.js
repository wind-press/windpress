import { find_tw_candidates } from '@windpress/oxide-parser-wasm';
import { minimatch } from 'minimatch';
import { useLogStore } from '@/dashboard/stores/log';
import { useApi } from '@/dashboard/library/api';

const api = useApi();

export async function loadSource(globs) {
    const logStore = useLogStore();

    let contents = [];

    const promises = globs.map(async (glob) => {
        let logId;
        if (glob.pattern.startsWith('jsdelivr:')) {
            logId = logStore.add({ message: `Loading source: jsDelivr (${glob.pattern})`, type: 'info' });
            contents.push(...await jsDelivrProvider(glob));
        } else if (glob.pattern.startsWith('http')) {
            logId = logStore.add({ message: `Loading source: Network (${glob.pattern})`, type: 'info' });
            contents.push(...await httpFileProvider(glob));
        } else if (glob.pattern.startsWith('wp-content:')) {
            logId = logStore.add({ message: `Loading source: WP Content (${glob.pattern})`, type: 'info' });
            contents.push(...await wpContentProvider(glob));
        }

        if (logId) {
            let currentLog = logStore.logs.find((log) => log.id === logId);

            currentLog.message += ' - done';
        }
    });

    await Promise.all(promises);

    const candidates_pool = [];

    let logId = logStore.add({ message: 'Scanning sources...', type: 'info' });

    contents.forEach((content) => {
        const candidates = find_tw_candidates(content);

        candidates_pool.push(...candidates);
    });

    let currentLog = logStore.logs.find((log) => log.id === logId);

    currentLog.message += ' - done';

    return Array.from(new Set(candidates_pool));
}

async function jsDelivrProvider(glob) {
    const contents_pool = [];

    // get the path without `jsdelivr:` prefix
    let sourcePath = glob.pattern.slice(String('jsdelivr:').length);

    let [packageNameVersion, ...pathPattern] = sourcePath.split('/');
    pathPattern = '/' + pathPattern.join('/');

    /**
     * Get files list from jsDelivr API and filter by path pattern
     * @see https://www.jsdelivr.com/docs/data.jsdelivr.com#get-/v1/packages/npm/-package-@-version-
     */
    let files = await fetch(`https://data.jsdelivr.com/v1/packages/npm/${packageNameVersion}?structure=flat`)
        .then((response) => response.json())
        .then((data) => data.files)
        .then((files) => files.map((file) => file.name))
        .then((files) => files.filter((file) => minimatch(file, pathPattern)));

    const promises = files.map(async (file) => {
        let content = await fetch(`https://cdn.jsdelivr.net/npm/${packageNameVersion}${file}`)
            .then((response) => response.text());

        contents_pool.push(content);
    });

    await Promise.all(promises);

    return contents_pool;
}

async function httpFileProvider(glob) {
    let content = await fetch(glob.pattern)
        .then((response) => response.text());

    return [content];
}

async function wpContentProvider(glob) {
    let sourcePath = glob.pattern.slice(String('wp-content:').length);

    const scan = await api
        .post('admin/local-file-provider/scan', {
            path: sourcePath,
        })
        .then((resp) => resp.data);

    return scan.contents.map((c) => c.content);
}