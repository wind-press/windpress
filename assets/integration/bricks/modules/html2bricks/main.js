/**
 * @module html2bricks 
 * @package WindPress
 * @since 1.0.1
 * @author Joshua Gugun Siagian <suabahasa@gmail.com>
 * 
 * Convert HTML string to Bricks element
 */

import { brxGlobalProp, settingsState } from '@/integration/bricks/constant.js';
import { watch } from 'vue';
import { logger } from '@/integration/common/logger';
import { parse } from './dom2elements.js';

/**
 * Check and request clipboard permission
 * 
 * @see https://web.dev/articles/async-clipboard
 * @see https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Interact_with_the_clipboard
 */
async function checkAndRequestClipboardPermission() {
    if (!navigator.permissions) {
        logger('Clipboard permissions not supported', { module: 'html2bricks', type: 'error' });
        return false;
    }

    let clipboardContent = '';

    // clipboard-read
    const readStatus = await navigator.permissions.query({ name: 'clipboard-read', allowWithoutGesture: false });

    if (readStatus.state === 'prompt') {
        logger('Requesting clipboard-read permission', { module: 'html2bricks' });

        clipboardContent = await navigator.clipboard.readText();

        if (readStatus.state !== 'granted') {
            logger('Clipboard-read permission denied', { module: 'html2bricks', type: 'error' });
            return false;
        }
    }

    // clipboard-write
    clipboardContent = await navigator.clipboard.readText();

    const writeStatus = await navigator.permissions.query({ name: 'clipboard-write' });

    if (writeStatus.state === 'prompt') {
        logger('Requesting clipboard-write permission', { module: 'html2bricks' });

        await navigator.clipboard.writeText(clipboardContent);

        if (writeStatus.state !== 'granted') {
            logger('Clipboard-write permission denied', { module: 'html2bricks', type: 'error' });
            return false;
        }
    }

    return true;
}

async function htmlPasteHandler() {
    if (!await checkAndRequestClipboardPermission()) {
        brxGlobalProp.$_showMessage('[WindPress] Clipboard access not available');
        return;
    }

    const clipboardText = (await navigator.clipboard.readText()).trim();

    if (!clipboardText || clipboardText.charAt(0) !== '<') {
        logger('Pasted content is not HTML', { module: 'html2bricks', type: 'error' });
        brxGlobalProp.$_showMessage('[WindPress] Pasted content is not HTML');
        return;
    }

    // parse HTML string to DOM
    const doc = (new DOMParser()).parseFromString(clipboardText, 'text/html').body;

    // convert DOM to Bricks element
    const bricksElements = parse(doc);

    const bricksData = {
        content: bricksElements,
        source: 'bricksCopiedElements',
        sourceUrl: window.bricksData.siteUrl,
        version: window.bricksData.version,
        globalClasses: [],
        globalElements: [],
    };

    // copy to clipboard
    await navigator.clipboard.writeText(JSON.stringify(bricksData, null));

    brxGlobalProp.$_pasteElements();

    brxGlobalProp.$_showMessage('[WindPress] HTML pasted');

    // restore clipboard content
    // await navigator.clipboard.writeText(clipboardText);
}

/**
 * Convert HTML string to Bricks element
 *
 * Windows: Ctrl + Shift + V
 * Mac: Cmd + Shift + V
 */
document.addEventListener('keydown', (event) => {
    if (!settingsState('module.html2bricks.copy-paste', true).value) {
        return;
    }

    if (event.target.id === 'bricks-toolbar' || event.target.id === 'bricks-panel') {
        return;
    }

    if (!(event.ctrlKey || event.metaKey) || !event.shiftKey || event.key.toLowerCase() !== 'v') {
        return;
    }

    event.stopPropagation();

    htmlPasteHandler();

}, true);

// insert "Paste HTML" menu item after "Paste" menu item
const pasteItemContextMenu = document.querySelector('#bricks-builder-context-menu li:nth-child(2)');
const pasteMenu = document.createElement('li');
pasteMenu.id = 'windpressbricks-html2bricks-context-menu';
pasteMenu.classList.add('sep');
pasteMenu.innerHTML = '<span class="label">Paste HTML</span><span class="shortcut">CTRL + SHIFT + V</span>';
pasteMenu.addEventListener('click', htmlPasteHandler);


// add "Paste HTML" button on the Structure panel header
const pasteItemStructureHeader = document.querySelector('#bricks-panel-header>ul.actions>li[data-balloon="Paste (All)"]');
const pasteHTMLStructureHeader = document.createElement('li');
pasteHTMLStructureHeader.dataset.balloon = 'Paste HTML';
pasteHTMLStructureHeader.dataset.balloonPos = 'bottom-right';
pasteHTMLStructureHeader.innerHTML = /*html*/`
    <span class="bricks-svg-wrapper">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="icon icon-tabler icons-tabler-outline icon-tabler-brand-html5" fill="none" stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M20 4l-2 14.5l-6 2l-6 -2l-2 -14.5z" /><path d="M15.5 8h-7l.5 4h6l-.5 3.5l-2.5 .75l-2.5 -.75l-.1 -.5" /></svg>
    </span>
`;

pasteHTMLStructureHeader.addEventListener('click', htmlPasteHandler);

const addControl = () => {
    pasteItemContextMenu.classList.remove('sep');
    pasteItemContextMenu.insertAdjacentElement('afterend', pasteMenu);
    pasteItemStructureHeader.insertAdjacentElement('afterend', pasteHTMLStructureHeader);
};

const removeControl = () => {
    pasteItemContextMenu.classList.add('sep');
    pasteMenu.remove();
    pasteHTMLStructureHeader.remove();
};

// initial
if (settingsState('module.html2bricks.copy-paste', true).value) {
    addControl();
}

watch(() => settingsState('module.html2bricks.copy-paste', true).value, (value) => {
    if (value) {
        addControl();
    } else {
        removeControl();
    }
});

logger('Module loaded!', { module: 'html2bricks' });