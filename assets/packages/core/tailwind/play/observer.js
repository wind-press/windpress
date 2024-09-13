import { decodeBase64, encodeBase64 } from '@std/encoding/base64';
import { build } from '../build';

/**
 * @type {HTMLStyleElement}
 */
let styleContainer;

const vfsContainer = document.querySelector('script[type="text/tailwindcss"]');

if (vfsContainer) {
    initListener();

    const vfsObserver = new MutationObserver(async () => {
        await applyStyles();
    });

    vfsObserver.observe(vfsContainer, {
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
    });

    if (document.body && candidates.size > 0) {
        if (!styleContainer || !styleContainer.isConnected) {
            styleContainer = document.createElement('style');
            document.head.append(styleContainer);
        }

        styleContainer.textContent = await build({
            candidates: Array.from(candidates),
            entrypoint: '/main.css',
            volume: JSON.parse(new TextDecoder().decode(decodeBase64(vfsContainer.textContent)))
        });
    }
}

// Ensure the styles are applied once (on load)
await applyStyles();

export function initListener() {
    const channel = new BroadcastChannel('windpress');

    channel.addEventListener('message', async (e) => {
        const data = e.data;
        const source = 'windpress/dashboard';
        const target = 'windpress/observer';
        const task = 'windpress.code-editor.saved';

        if (data.source === source && data.target === target && data.task === task) {
            vfsContainer.textContent = encodeBase64(JSON.stringify(data.payload.volume));

            await applyStyles();
        }
    })
}
