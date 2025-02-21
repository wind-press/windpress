import { loadDesignSystem } from '../design-system';
import { set } from 'lodash-es';
import { candidatesToCss } from '../intellisense';
import { decodeVFSContainer } from '../vfs';

const vfsContainer = document.querySelector('script#windpress\\:vfs[type="text/plain"]');

async function classnameToCss(input) {
    let classes = input
        .split(/\s+/)
        .filter((x) => x !== "" && x !== "|");

    const volume = decodeVFSContainer(vfsContainer.textContent);

    const design = await loadDesignSystem({ volume });

    let css = await candidatesToCss(design, classes);

    return Array.isArray(css) ? css.join(" ") : css;
}

// if the wp-hooks is available
if (window.wp?.hooks) {
    window.wp.hooks.addFilter('windpress.module.classname-to-css', 'windpress', classnameToCss);
}

set(window, 'windpress.loaded.module.classnameToCss', true);
set(window, 'windpress.module.classnameToCss.generate', async (input) => classnameToCss(input));