import './style.scss';

import { logger } from '@/integration/common/logger';
import tippy, { followCursor } from 'tippy.js';
import { etchIframe } from '@/integration/etch/constant.js';

import { createHighlighterCore } from 'shiki/core';
import { createOnigurumaEngine } from 'shiki/engine/oniguruma';

let shikiHighlighter = null;

(async () => {
    shikiHighlighter = await createHighlighterCore({
        themes: [
            import('shiki/themes/dark-plus.mjs'),
            import('shiki/themes/light-plus.mjs'),
        ],
        langs: [
            import('shiki/langs/css.mjs'),
        ],
        engine: createOnigurumaEngine(import('shiki/wasm')),
    });
})();

// observe the document for changes and then querySelector all `.cm-etch-selector` element to be attached our custom event listener
let tippyInstance = tippy(document.createElement('div'), {
    plugins: [followCursor],
    allowHTML: true,
    arrow: false,
    duration: [500, 0],
    followCursor: true,
    trigger: 'manual',
});


// tippyInstance.reference = hitContainerEl;

async function showTippy(classname: string) {
    const generatedCssCode = await etchIframe().contentWindow.windpress.module.classnameToCss.generate(classname);
    if (generatedCssCode === null || generatedCssCode.trim() === '') {
        return null;
    };

    tippyInstance.setContent(shikiHighlighter.codeToHtml(generatedCssCode, {
        lang: 'css',
        theme: 'dark-plus',
    }));

    tippyInstance.show();
}

const observer = new MutationObserver(() => {
    const elements = document.querySelectorAll('.cm-etch-selector');
    // <span class="cm-etch-selector"><span class="ͼ15">mx-auto</span></span>
    elements.forEach((element) => {
        element.addEventListener('mouseover', () => {
            // get the text content of the element like `mx-auto`
            const textContent = element.firstChild?.textContent;
            if (textContent) {
                // console.log('textContent', textContent);
                showTippy(textContent);
                // show the tippy instance
            }
        });

        element.addEventListener('mouseout', () => {
            // hide the tippy instance
            tippyInstance.hide();
        });
    });
});

observer.observe(document, {
    characterData: true,
    subtree: true,
    childList: true,
});

logger('Intellisense: classname-to-css.ts loaded');
