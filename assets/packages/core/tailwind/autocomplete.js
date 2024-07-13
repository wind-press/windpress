import { __unstable__loadDesignSystem } from 'tailwindcss';
import { getClassList, getVariableList } from './intellisense';
import { set } from 'lodash-es';
import { bundle } from './bundle';

let classLists = [];
let variableLists = [];

const channel = new BroadcastChannel('windpress');

const mainCssContainer = document.querySelector('script[type="text/tailwindcss"]');

if (mainCssContainer) {
    initListener(mainCssContainer, preloadItems);

    const mainCssObserver = new MutationObserver(async () => {
        await preloadItems();
    });

    mainCssObserver.observe(mainCssContainer, {
        characterData: true,
        subtree: true
    });
}

async function getCssContent() {
    const mainCssElement = document.querySelector('script[type="text/tailwindcss"]');
    const mainCssContent = mainCssElement?.textContent ? atob(mainCssElement.textContent) : `@import "tailwindcss"`;

    const bundleResult = await bundle({
        entrypoint: '/main.css',
        volume: {
            '/main.css': mainCssContent,
        }
    });

    return bundleResult.css;
}

async function preloadItems() {
    classLists = getClassList(__unstable__loadDesignSystem(await getCssContent()));

    console.log('classLists', classLists);

    channel.postMessage({
        source: 'windpress/autocomplete',
        target: 'any',
        task: `windpress.main_css.saved.done`
    });
}

// Ensure the items generated once (on load)
await preloadItems();

/**
 * @param {Element} mainCssContainer
 * @param {Function} preloadItems
 */
export function initListener(mainCssContainer, preloadItems) {
    channel.addEventListener('message', async (e) => {
        const data = e.data;
        const source = 'windpress/dashboard';
        const target = 'windpress/observer';
        const task = 'windpress.main_css.saved';

        if (data.source === source && data.target === target && data.task === task) {
            await preloadItems();
        }
    });
}

function getColor(declarations) {
    const color = declarations?.find((declaration) =>
        declaration.property.includes('color')
    )

    return color?.value || null;
}

function searchClassList(query) {
    // split query by `:` and search for each subquery
    let segment = query.split(':');
    let prefix = segment.slice(0, -1).join(':');
    let q = segment.pop();

    const filteredClassList = classLists.filter((classList) => classList.selector.includes(q));

    return filteredClassList.map((classList) => {
        return {
            value: [prefix, classList.selector].filter(Boolean).join(':'),
            color: getColor(classList.declarations)
        }
    });
}

// check if the wp-hooks is available
if (window.wp?.hooks) {
    window.wp.hooks.addFilter('windpress.module.autocomplete', 'windpress', searchClassList);
    window.wp.hooks.addFilter('windpress.module.design_system.main_css', 'windpress', async () => {
        return await getCssContent();
    });
}

set(window, 'windpress.loaded.module.autocomplete', true);
set(window, 'windpress.module.autocomplete.query', (q) => searchClassList(q));

set(window, 'windpress.loaded.module.design_system', true);
set(window, 'windpress.module.design_system.main_css', async () => {
    return await getCssContent();
});
