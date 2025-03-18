import { encodeBase64 } from '@std/encoding/base64';
import { build } from '../build';
import { decodeVFSContainer } from '@/packages/core/tailwindcss';
import { resolveConfig } from '../resolve-config';

/**
 * @type {HTMLStyleElement}
 */
let styleContainer;

let resolvedConfig = null;

let lastCandidateSet = new Set();

const vfsContainer = document.querySelector('script#windpress\\:vfs[type="text/plain"]');

if (vfsContainer) {
    initListener();

    const vfsObserver = new MutationObserver(async () => {
        await refreshStyles();
    });

    vfsObserver.observe(vfsContainer, {
        characterData: true,
        subtree: true
    });
}

async function refreshStyles() {
    const volume = decodeVFSContainer(vfsContainer.textContent);

    resolvedConfig = await resolveConfig(volume);

    await applyStyles();
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

        // compare the new candidates with the last set
        if (lastCandidateSet.size === candidates.size) {
            let isDifferent = false;

            for (let candidate of candidates) {
                if (!lastCandidateSet.has(candidate)) {
                    isDifferent = true;
                    break;
                }
            }

            if (!isDifferent) {
                return;
            }
        }

        // update the last set
        lastCandidateSet = candidates;

        styleContainer.textContent = await build({
            entrypoint: {
                css: '/main.css',
                config: '/tailwind.config.js',
            },
            contents: Array.from(candidates),
            volume: decodeVFSContainer(vfsContainer.textContent),
            options: {
                resolvedConfig,
            }
        });
    }
}

// Ensure the styles are refreshed once (on load)
await refreshStyles();

export function initListener() {
    const channel = new BroadcastChannel('windpress');

    channel.addEventListener('message', async (e) => {
        const data = e.data;
        const source = 'windpress/dashboard';
        const target = 'windpress/observer';
        const task = 'windpress.code-editor.saved';

        if (data.source === source && data.target === target && data.task === task) {
            vfsContainer.textContent = encodeBase64(JSON.stringify(data.payload.volume));

            await refreshStyles();
        }
    })
}