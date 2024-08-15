import { __unstable__loadDesignSystem } from 'tailwindcss';
import { set } from 'lodash-es';
import { candidatesToCss, getCssContent } from '../intellisense';

async function classnameToCss(input) {
    let classes = input
        .split(/\s+/)
        .filter((x) => x !== "" && x !== "|");

    const design = await __unstable__loadDesignSystem(await getCssContent());

    return (await candidatesToCss(design, classes)).join(" ");
}

// if the wp-hooks is available
if (window.wp?.hooks) {
    window.wp.hooks.addFilter('windpress.module.classname-to-css', 'windpress', classnameToCss);
}

set(window, 'windpress.loaded.module.classnameToCss', true);
set(window, 'windpress.module.classnameToCss.generate', async (input) => classnameToCss(input));