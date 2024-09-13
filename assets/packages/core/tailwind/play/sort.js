import { loadDesignSystem } from '../design-system';
import { set } from 'lodash-es';
import { sortClasses } from '../intellisense';
import { decodeVFSContainer } from '../bundle';

const vfsContainer = document.querySelector('script[type="text/tailwindcss"]');

async function classSorter(input) {
    let classes = input
        .split(/\s+/)
        .filter((x) => x !== "" && x !== "|");

    const volume = decodeVFSContainer(vfsContainer.textContent);

    const design = await loadDesignSystem({ volume });

    return (await sortClasses(design, classes)).join(" ");
}

// if the wp-hooks is available
if (window.wp?.hooks) {
    window.wp.hooks.addFilter('windpress.module.class-sorter', 'windpress', classSorter);
}

set(window, 'windpress.loaded.module.classSorter', true);
set(window, 'windpress.module.classSorter.sort', async (input) => classSorter(input));