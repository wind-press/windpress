import { __unstable__loadDesignSystem } from 'tailwindcss';
import { getClassList, getCssContent, getVariableList } from '../intellisense';
import { set } from 'lodash-es';

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

async function preloadItems() {
    classLists = await getClassList(await __unstable__loadDesignSystem(await getCssContent()));

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
    // if the query is empty, return all classList
    if (query === '') {
        return classLists.map((classList) => {
            return {
                value: classList.selector,
                color: getColor(classList.declarations)
            }
        });
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

    let filteredClassList = classLists.filter((classList) => classList.selector.includes(q));

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
                    selector: classList.selector + '/' + i
                });
            }
        });

        filteredClassList = tempFilteredClassList;
    }

    return filteredClassList.map((classList) => {
        return {
            value: [prefix, (importantModifier ? '!' : '') + classList.selector].filter(Boolean).join(':'),
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
