import { __unstable__loadDesignSystem } from 'tailwindcss';
import { getClassList } from './intellisense';
import { set } from 'lodash-es';
import twTheme from 'tailwindcss/theme.css?inline';

let classLists = [];
let variableLists = [];

let designSystem;

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

async function preloadItems() {
    const mainCssElement = document.querySelector('script[type="text/tailwindcss"]');
    const mainCssContent = mainCssElement?.textContent ? twTheme + atob(mainCssElement.textContent) : `@import "tailwindcss"`;

    designSystem = __unstable__loadDesignSystem(mainCssContent);

    classLists = getClassList(designSystem);
}

// Ensure the items generated once (on load)
await preloadItems();

/**
 * @param {Element} mainCssContainer
 * @param {Function} preloadItems
 */
export function initListener(mainCssContainer, preloadItems) {
    const channel = new BroadcastChannel('windpress');

    channel.addEventListener('message', async (e) => {
        const data = e.data;
        const source = 'windpress/dashboard';
        const target = 'windpress/observer';
        const task = 'windpress.main_css.saved';

        if (data.source === source && data.target === target && data.task === task) {
            await preloadItems();
        }
    })
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
}

set(window, 'windpress.loaded.module.autocomplete', true);
set(window, 'windpress.module.autocomplete.query', (q) => searchClassList(q));