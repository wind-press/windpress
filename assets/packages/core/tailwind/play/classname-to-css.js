import { loadDesignSystem } from '../design-system';
import { set } from 'lodash-es';
import { candidatesToCss } from '../intellisense';
import { decodeBase64 } from '@std/encoding/base64';

const vfsContainer = document.querySelector('script[type="text/tailwindcss"]');

async function classnameToCss(input) {
    let classes = input
        .split(/\s+/)
        .filter((x) => x !== "" && x !== "|");

    const volume = JSON.parse(new TextDecoder().decode(decodeBase64(vfsContainer.textContent)));

    const design = await loadDesignSystem({ volume });

    return (await candidatesToCss(design, classes)).join(" ");
}

// if the wp-hooks is available
if (window.wp?.hooks) {
    window.wp.hooks.addFilter('windpress.module.classname-to-css', 'windpress', classnameToCss);
}

set(window, 'windpress.loaded.module.classnameToCss', true);
set(window, 'windpress.module.classnameToCss.generate', async (input) => classnameToCss(input));