import { minimatch } from 'minimatch';
import { createLogComposable } from '@/dashboard/stores/log'
import { useApi } from '@/dashboard/library/api';
import { parse as parsePackageName } from 'parse-package-name';

export type Source = {
    base: string;
    pattern: string;
    negated: boolean;
};

export async function loadSource(sources: Source[]) {
    const logStore = createLogComposable();

    let contents: string[] = [];

    const promises = sources.map(async (source) => {
        if (source.negated) {
            return;
        }

        let logId;
        if (source.pattern.startsWith('jsdelivr:')) {
            logId = logStore.add({ message: `Loading source: jsDelivr (${source.pattern})`, type: 'info', group: 'source' });
            contents.push(...await jsDelivrProvider(source));
        } else if (source.pattern.startsWith('http')) {
            logId = logStore.add({ message: `Loading source: Network (${source.pattern})`, type: 'info', group: 'source' });
            contents.push(...await httpFileProvider(source));
        } else if (source.pattern.startsWith('wp-content:')) {
            logId = logStore.add({ message: `Loading source: WP Content (${source.pattern})`, type: 'info', group: 'source' });
            contents.push(...await wpContentProvider(source));
        }

        if (logId) {
            let currentLog = logStore.logs.value.find((log) => log.id === logId);

            if (currentLog) {
                currentLog.message += ' - done';
            }
        }
    });

    await Promise.all(promises);

    return contents;
}

async function jsDelivrProvider(source: Source) {
    const contents_pool: string[] = [];

    // get the path without `jsdelivr:` prefix
    let sourcePath = source.pattern.slice(String('jsdelivr:').length);

    let { name: packageName, version: packageVersion, path: pathPattern  } = parsePackageName(sourcePath);

    /**
     * Get files list from jsDelivr API and filter by path pattern
     * @see https://www.jsdelivr.com/docs/data.jsdelivr.com#get-/v1/packages/npm/-package-@-version-
     */

    let files: string[] = await fetch(`https://data.jsdelivr.com/v1/packages/npm/${packageName}@${packageVersion}?structure=flat`)
        .then((response) => response.json())
        .then((data) => data.files)
        .then((files: { name: string }[]) => files.map((file) => file.name))
        .then((files) => files.filter((file) => minimatch(file, pathPattern)));

    const promises = files.map(async (file) => {
        let content = await fetch(`https://cdn.jsdelivr.net/npm/${packageName}@${packageVersion}${file}`)
            .then((response) => response.text());

        contents_pool.push(content);
    });

    await Promise.all(promises);

    return contents_pool;
}

async function httpFileProvider(source: Source) {
    let content = await fetch(source.pattern)
        .then((response) => response.text());

    return [content];
}

async function wpContentProvider(source: Source) {
    let sourcePath = source.pattern.slice(String('wp-content:').length);

    const scan = await useApi()
        .post('admin/local-file-provider/scan', {
            path: sourcePath,
        })
        .then((resp) => resp.data);

    return scan.contents.map((c: { content: string }) => c.content);
}