import { computed, ref } from 'vue';

import { set } from 'lodash-es';
import { loadDesignSystem } from '../design-system';
import { decodeVFSContainer } from '../vfs';

import { classnameToCss } from './classname-to-css';
import { classSorter } from './sort';
import { searchClassList } from './autocomplete';

import type { DesignSystem } from '@tailwindcss/root/packages/tailwindcss/src/design-system';

const channel = new BroadcastChannel('windpress');
const vfsContainer = document.querySelector('script#windpress\\:vfs[type="text/plain"]');
const volume = ref(null);


let design: DesignSystem;

function initListener() {
    channel.addEventListener('message', async (e) => {
        const data = e.data;
        const source = 'windpress/dashboard';
        const target = 'windpress/observer';
        const task = 'windpress.code-editor.saved';

        if (data.source === source && data.target === target && data.task === task) {
            
        }
    });
}

async function init() {
    design = await loadDesignSystem({ volume: decodeVFSContainer(vfsContainer?.textContent || '') })
}

initListener();

if (vfsContainer) {
    const vfsObserver = new MutationObserver(async () => {
        // await preloadItems();
    });

    vfsObserver.observe(vfsContainer, {
        characterData: true,
        subtree: true
    });



    set(window, 'windpress.module.autocomplete.query', (q: string) => searchClassList(q));
    set(window, 'windpress.module.classnameToCss.generate', async (input: string) => classnameToCss(design, input));
    set(window, 'windpress.module.classSorter.sort', async (input: string) => classSorter(design, input));
}
