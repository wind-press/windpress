import { set } from 'lodash-es';
import { loadDesignSystem } from '../design-system';
import { decodeVFSContainer, type VFSContainer } from '../vfs';

import { classnameToCss } from './classname-to-css';
import { classSorter } from './sort';
import { searchClassList } from './autocomplete';

import type { DesignSystem } from '@tailwindcss/root/packages/tailwindcss/src/design-system';

const channel = new BroadcastChannel('windpress');
const vfsContainer = document.querySelector('script#windpress\\:vfs[type="text/plain"]');

let design: DesignSystem;
let volume: VFSContainer;

async function updateDesign() {
    volume = decodeVFSContainer(vfsContainer?.textContent || 'e30=');
    design = await loadDesignSystem({ volume });

    channel.postMessage({
        source: 'windpress/intellisense',
        target: 'any',
        task: `windpress.code-editor.saved.done`
    });
}

// initial load
updateDesign();

if (vfsContainer) {
    const vfsObserver = new MutationObserver(async () => {
        updateDesign();
    });

    vfsObserver.observe(vfsContainer, {
        characterData: true,
        subtree: true
    });
}

channel.addEventListener('message', async (e) => {
    const data = e.data;
    const source = 'windpress/dashboard';
    const target = 'windpress/observer';
    const task = 'windpress.code-editor.saved';

    if (data.source === source && data.target === target && data.task === task) {
        updateDesign();
    }
});

set(window, 'windpress.module.autocomplete.query', (q: string) => searchClassList(volume, design, q));
set(window, 'windpress.module.classnameToCss.generate', async (input: string) => classnameToCss(design, input));
set(window, 'windpress.module.classSorter.sort', async (input: string) => classSorter(design, input));
