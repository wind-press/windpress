import { set } from 'lodash-es';
import Fuse from 'fuse.js';
import { doComplete } from 'https://esm.sh/tailwindcss-language-service';
import { decodeVFSContainer } from '@/packages/core/tailwindcss-v4';
import { getTextDocument, stateFromConfig } from '../intellisense';
import { resolveConfig } from '../resolve-config';

let classLists = [];

const channel = new BroadcastChannel('windpress');

const vfsContainer = document.querySelector('script#windpress\\:vfs[type="text/plain"]');

if (vfsContainer) {
    initListener();

    const vfsObserver = new MutationObserver(async () => {
        await preloadItems();
    });

    vfsObserver.observe(vfsContainer, {
        characterData: true,
        subtree: true
    });
}

async function preloadItems() {
    const volume = decodeVFSContainer(vfsContainer.textContent);

    const resolvedConfig = await resolveConfig(volume);

    const textDocument = getTextDocument(`<div class=""></div>`);

    const state = stateFromConfig(resolvedConfig);

    const position = { character: 12, line: 0, };

    const results = (
        await doComplete(state, textDocument, position)
    ).items.map((item) => {
        return {
            value: item.label,
            color: typeof item.documentation === 'string' ? item.documentation : null,
            isVariant: item.data._type === 'variant',
        };
    });

    classLists = results;

    channel.postMessage({
        source: 'windpress/autocomplete',
        target: 'any',
        task: `windpress.code-editor.saved.done`
    });
}

// Ensure the items generated once (on load)
await preloadItems();

export function initListener() {
    channel.addEventListener('message', async (e) => {
        const data = e.data;
        const source = 'windpress/dashboard';
        const target = 'windpress/observer';
        const task = 'windpress.code-editor.saved';

        if (data.source === source && data.target === target && data.task === task) {
            await preloadItems();
        }
    });
}

async function searchClassList(query) {
    // if the query is empty, return all classList
    if (query === '') {
        return classLists;
    }

    // split query by `:` and search for each subquery
    let segment = query.split(':');
    let prefix = segment.slice(0, -1).join(':');
    let q = segment.pop();

    // if `!` exists as the first character on the query, cut it and mark as important
    let importantModifier = '';
    if (q.startsWith('!')) {
        q = q.slice(1);
        importantModifier = '!';
    }

    // check if opacity modifier is used, for example `bg-red-500/20`. the opacity modifier is a number between 0 and 100
    let opacityModifier = false;
    if (q.includes('/')) {
        let [_q, opacity] = q.split('/');
        // if the opacity modifier is not a number between 0 and 100, revert back the split
        if (opacity === '') {
            q = _q;
            opacityModifier = opacity;
        } else if (isNaN(opacity) || opacity < 0 || opacity > 100) {
            q = [_q, opacity].join('/');
        } else {
            q = _q;
            opacityModifier = parseInt(opacity);
        }
    }

    let filteredClassList = classLists.filter((classList) => classList.value.includes(q));

    // if opacityModifier is not false, populate the filteredClassList with the opacityModifier (1 to 100)
    if (opacityModifier !== false) {
        let tempFilteredClassList = [];

        const loopIncrement = opacityModifier === '' ? 5 : 1;
        const loopStart = opacityModifier === '' || opacityModifier > 9 ? 0 : Math.floor((opacityModifier * 10 + 1) / 10) * 10;
        const loopEnd = opacityModifier === '' || opacityModifier > 9 ? 100 : Math.ceil((opacityModifier * 10 + 1) / 10) * 10;

        filteredClassList.forEach((classList) => {
            for (let i = loopStart; i <= loopEnd; i += loopIncrement) {
                tempFilteredClassList.push({
                    ...classList,
                    value: classList.value + '/' + i
                });
            }
        });

        filteredClassList = tempFilteredClassList;
    }

    const fuse = new Fuse(filteredClassList, {
        keys: ['value'],
        threshold: 0.4,
    });

    return fuse.search(q).map(({ item }) => {
        return {
            value: [prefix, (importantModifier ? '!' : '') + item.value].filter(Boolean).join(':'),
            color: item.color
        }
    });
}

// check if the wp-hooks is available
if (window.wp?.hooks) {
    window.wp.hooks.addFilter('windpress.module.autocomplete', 'windpress', searchClassList);
}

set(window, 'windpress.loaded.module.autocomplete', true);
set(window, 'windpress.module.autocomplete.query', (q) => searchClassList(q));
