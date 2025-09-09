/**
 * @module htmleditor
 * @package WindPress
 * @since 3.0.0
 * @author Joshua Gugun Siagian <suabahasa@gmail.com>
 * 
 * Enhance the ace editor with Tailwind CSS class name autocomplete.
 */

import './style.scss';

import { logger } from '@/integration/common/logger';
import { debounce } from 'lodash-es';
import { previewIframe } from '@/integration/livecanvas/constant.js';

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

async function searchQuery(query) {
    const suggestions = (await wp.hooks.applyFilters('windpresslivecanvas-autocomplete-items-query', query)).map((s) => {
        return {
            value: s.value,
            meta: 'TW',
            caption: s.value,
            score: 1000, // Custom score for sorting (optional)
            docHTML: s.color
                ? `<div style="display: flex; align-items: center; gap: 8px;"><div style="width:16px; height:16px; background:${s.color}; border:1px solid #ccc;"></div><span>${s.color}</span></div>`
                : undefined,
        };
    });

    return suggestions;
}

const langTools = ace.require('ace/ext/language_tools');

langTools.addCompleter({
    getCompletions: function (editor, session, pos, prefix, callback) {
        let lineTillCursor = session.getDocument().getLine(pos.row).substring(0, pos.column);
        if (/class=["|'][^"']*$/i.test(lineTillCursor) || /@apply\s+[^;]*$/i.test(lineTillCursor)) {
            searchQuery(prefix).then((suggestions) => {
                callback(null, suggestions);
            }).catch(error => {
                console.error('Error fetching autocomplete suggestions:', error);
                callback(error, []);
            });
        } else {
            callback(null, []); // No suggestions if the context is not matched
        }
    }
});

const tooltip = ace.require('ace/tooltip').Tooltip;
const hoverTooltip = new tooltip(document.body);

hoverTooltip.setText('');
hoverTooltip.hide();

const debouncedMousemoveHandler = debounce(async function (e) {
    const pos = e.getDocumentPosition();
    const session = lc_html_editor.getSession();
    const token = session.getTokenAt(pos.row, pos.column);

    if (!token || !/attribute-value/.test(token.type)) {
        hoverTooltip.hide();
        return;
    }

    // Get the current line text
    const line = session.getLine(pos.row);// Match class attribute
    const classAttrMatch = line.match(/class\s*=\s*["']([^"']*)["']/);
    if (!classAttrMatch) {
        hoverTooltip.hide();
        return;
    }

    const classValue = classAttrMatch[1]; // e.g. 'btn btn-primary card'
    const classStartIndex = line.indexOf(classValue); // start index of attribute value in line
    const cursorOffset = pos.column - classStartIndex;

    if (cursorOffset < 0 || cursorOffset > classValue.length) {
        hoverTooltip.hide();
        return;
    }

    // Split into classes and find which one cursor is on
    const parts = classValue.split(/\s+/);
    let classname = null;
    let idx = 0;

    for (let part of parts) {
        const start = idx;
        const end = idx + part.length;
        if (cursorOffset >= start && cursorOffset <= end) {
            classname = part;
            break;
        }
        idx = end + 1; // +1 for the space
    }

    const generatedCssCode = await previewIframe.contentWindow.windpress.module.classnameToCss.generate(classname);
    if (generatedCssCode === null || generatedCssCode.trim() === '') {
        hoverTooltip.hide();
    } else {
        hoverTooltip.setHtml(shikiHighlighter.codeToHtml(generatedCssCode, {
            lang: 'css',
            theme: 'dark-plus',
        }));
        hoverTooltip.setPosition(e.domEvent.clientX + 10, e.domEvent.clientY + 10);
        hoverTooltip.show();
    }
}, 10);

lc_html_editor.addEventListener('mousemove', debouncedMousemoveHandler);
lc_html_editor.addEventListener('mouseleave', function (event) {
    debouncedMousemoveHandler.cancel();
});

logger('Module loaded!', { module: 'htmleditor' });