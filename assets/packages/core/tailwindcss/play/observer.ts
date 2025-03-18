import { encodeBase64 } from '@std/encoding/base64';
import { build } from '../build';
import { decodeVFSContainer } from '../vfs';

let styleContainer: HTMLStyleElement | null = null;

let lastCandidateSet = new Set();

const vfsContainer = document.querySelector('script#windpress\\:vfs[type="text/plain"]');

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
        const target = mutation.target as HTMLElement;

        if (target.nodeType === 1 && ignoredTags.includes((target as HTMLElement).tagName)) {
            needsUpdate = false;
        }

        for (let node of mutation.addedNodes) {
            /**
             * @type {HTMLElement}
             */
            const element = node;

            if (
                element.nodeType === 1 &&
                ignoredTags.includes((element as HTMLElement).tagName)
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
            candidates: Array.from(candidates) as string[],
            entrypoint: '/main.css',
            volume: decodeVFSContainer(vfsContainer?.textContent || 'e30=')
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
            if (vfsContainer) {
                vfsContainer.textContent = encodeBase64(JSON.stringify(data.payload.volume));
                await applyStyles();
            }
        }
    })
}
