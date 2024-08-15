import { __unstable__loadDesignSystem } from 'tailwindcss';
import { set } from 'lodash-es';
import { getCssContent, sortClasses } from '../intellisense';

async function classSorter(input) {
    let classes = input
        .split(/\s+/)
        .filter((x) => x !== "" && x !== "|");

    const design = await __unstable__loadDesignSystem(await getCssContent());

    return (await sortClasses(design, classes)).join(" ");
}

// if the wp-hooks is available
if (window.wp?.hooks) {
    window.wp.hooks.addFilter('windpress.module.class-sorter', 'windpress', classSorter);
}

set(window, 'windpress.loaded.module.classSorter', true);
set(window, 'windpress.module.classSorter.sort', async (input) => classSorter(input));