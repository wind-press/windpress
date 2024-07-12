import { __unstable__loadDesignSystem } from 'tailwindcss';
import { set } from 'lodash-es';
import { bundle } from './bundle';
import { sortClasses } from './intellisense';

async function getCssContent() {
    const mainCssElement = document.querySelector('script[type="text/tailwindcss"]');
    const mainCssContent = mainCssElement?.textContent ? atob(mainCssElement.textContent) : `@import "tailwindcss"`;

    const bundleResult = await bundle({
        entrypoint: '/main.css',
        volume: {
            '/main.css': mainCssContent,
        }
    });

    return bundleResult.css;
}

async function classSorter(input) {
    let classes = input
        .split(/\s+/)
        .filter((x) => x !== "" && x !== "|");

    const design = __unstable__loadDesignSystem(await getCssContent());

    return sortClasses(design, classes).join(" ");
}

// if the wp-hooks is available
if (window.wp?.hooks) {
    window.wp.hooks.addFilter('windpress.module.class-sorter', 'windpress', classSorter);
}

set(window, 'windpress.loaded.module.classSorter', true);
set(window, 'windpress.module.classSorter.sort', async (input) => classSorter(input));