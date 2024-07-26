import { build } from '../build';

/**
 * @type {HTMLStyleElement}
 */
let styleContainer;

const mainCssContainer = document.querySelector('script[type="text/tailwindcss"]');

if (mainCssContainer) {
    initListener(mainCssContainer, applyStyles);

    const mainCssObserver = new MutationObserver(async () => {
        await applyStyles();
    });

    mainCssObserver.observe(mainCssContainer, {
        characterData: true,
        subtree: true
    });
}

const domObserver = new MutationObserver(async (mutations) => {
    const ignoredTags = ['STYLE', 'SCRIPT'];
    let needsUpdate = true;

    for (let mutation of mutations) {
        /**
         * @type {HTMLElement}
         */
        const target = mutation.target;

        if (target.nodeType === 1 && ignoredTags.includes(target.tagName)) {
            needsUpdate = false;
        }

        for (let node of mutation.addedNodes) {
            /**
             * @type {HTMLElement}
             */
            const element = node;

            if (
                element.nodeType === 1 &&
                ignoredTags.includes(element.tagName)
            ) {
                needsUpdate = false;
            }
        }
    }

    if (needsUpdate) {
        await applyStyles();
    }
})

domObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
    subtree: true,
    childList: true
});

async function applyStyles() {
    const candidates = new Set();

    document.querySelectorAll('[class]').forEach((element) => {
        element.classList.forEach((className) => candidates.add(className));
    })

    const mainCssElement = document.querySelector('script[type="text/tailwindcss"]');
    const mainCssContent = mainCssElement?.textContent ? atob(mainCssElement.textContent) : `@import "tailwindcss"`;

    if (document.body && candidates.size > 0) {
        if (!styleContainer || !styleContainer.isConnected) {
            styleContainer = document.createElement('style');
            document.head.append(styleContainer);
        }

        styleContainer.textContent = await build({
            candidates: Array.from(candidates),
            entrypoint: '/index.css',
            volume: {
                '/index.css': mainCssContent
            }
        });
    }
}

// Ensure the styles are applied once (on load)
await applyStyles();

/**
 * @param {Element} mainCssContainer
 * @param {Function} applyStyles
 */
export function initListener(mainCssContainer, applyStyles) {
    const channel = new BroadcastChannel('windpress');

    channel.addEventListener('message', async (e) => {
        const data = e.data;
        const source = 'windpress/dashboard';
        const target = 'windpress/observer';
        const task = 'windpress.main_css.saved';

        if (data.source === source && data.target === target && data.task === task) {
            mainCssContainer.textContent = btoa(data.payload.main_css.current);

            await applyStyles();
        }
    })
}
