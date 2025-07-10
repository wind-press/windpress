import WindPressIconOriginal from '~/windpress.svg?react';
import './block-editor.scss';

import tippy, { followCursor } from 'tippy.js';
import { createHighlighterCore } from 'shiki/core';
import { createOnigurumaEngine } from 'shiki/engine/oniguruma';

import { __ } from '@wordpress/i18n';
import { InspectorControls } from '@wordpress/block-editor';
import { PanelBody, PanelRow, TextareaControl, Button } from '@wordpress/components';
import autosize from 'autosize';
import Tribute from 'tributejs';
import { debounce } from 'lodash-es';

import HighlightInTextarea from '@/integration/library/highlight-in-textarea.js';

import { useEffect, useRef } from 'react';
import type { WindPressIconProps, AutocompleteItem, TributeItem, BlockEditProps, ShikiHighlighter } from './utils/types';

let shikiHighlighter: ShikiHighlighter | null = null;

const WindPressIcon = (props: WindPressIconProps) => {
    return (
        <WindPressIconOriginal {...props} width={20} height={20} aria-hidden="true" focusable="false" />
    );
};

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

let hit: any = null;
let autocompleteItems: AutocompleteItem[] = [];

(window as any).wp.hooks.addAction('windpressgutenberg-autocomplete-items-refresh', 'windpressgutenberg', () => {
    // wp hook filters. {value, color?, fontWeight?, namespace?}[]
    autocompleteItems = (window as any).wp.hooks.applyFilters('windpressgutenberg-autocomplete-items', [], '');
});

(window as any).wp.hooks.doAction('windpressgutenberg-autocomplete-items-refresh');

const tribute = new Tribute({
    containerClass: 'windpressgutenberg-tribute-container',

    autocompleteMode: true,

    // Limits the number of items in the menu
    menuItemLimit: 50,

    noMatchTemplate: '',

    values: async function (text: string, cb: (items: AutocompleteItem[]) => void) {
        const filters = await (window as any).wp.hooks.applyFilters('windpressgutenberg-autocomplete-items-query', autocompleteItems, text);
        cb(filters);
    },

    lookup: 'value',

    itemClass: 'class-item',

    // template
    menuItemTemplate: function (item: any) {
        let customStyle = '';

        if (item.original.color !== undefined) {
            customStyle += `background-color: ${item.original.color};`;
        }

        if (item.original.fontWeight !== undefined) {
            customStyle += `font-weight: ${item.original.fontWeight};`;
        }

        return `
            <span class="class-name" data-tribute-class-name="${item.original.value}">${item.string}</span>
            <span class="class-hint" style="${customStyle}"></span>
        `;
    },
});

tribute.setMenuContainer = function (el) {
    this.menuContainer = el;
};

const tributeEventCallbackOrigFn = tribute.events.callbacks;

tribute.events.callbacks = function () {
    return {
        ...tributeEventCallbackOrigFn.call(this),
        up: (e) => {
            // navigate up ul
            if (this.tribute.isActive && this.tribute.current.filteredItems) {
                e.preventDefault();
                e.stopPropagation();
                let count = this.tribute.current.filteredItems.length,
                    selected = this.tribute.menuSelected;

                if (count > selected && selected > 0) {
                    this.tribute.menuSelected--;
                    this.setActiveLi();
                } else if (selected === 0) {
                    this.tribute.menuSelected = count - 1;
                    this.setActiveLi();
                    this.tribute.menu.scrollTop = this.tribute.menu.scrollHeight;
                }
                previewTributeEventCallbackUpDown();
            }
        },
        down: (e) => {
            // navigate down ul
            if (this.tribute.isActive && this.tribute.current.filteredItems) {
                e.preventDefault();
                e.stopPropagation();
                let count = this.tribute.current.filteredItems.length - 1,
                    selected = this.tribute.menuSelected;

                if (count > selected) {
                    this.tribute.menuSelected++;
                    this.setActiveLi();
                } else if (count === selected) {
                    this.tribute.menuSelected = 0;
                    this.setActiveLi();
                    this.tribute.menu.scrollTop = 0;
                }
                previewTributeEventCallbackUpDown();
            }
        },
    };
};

// create a tippy instance that will be used to show the hover preview, but not yet shown
let tippyInstance = tippy(document.createElement('div'), {
    plugins: [followCursor],
    allowHTML: true,
    arrow: false,
    duration: [500, 0],
    followCursor: true,
    trigger: 'manual',
});

function hoverPreviewProvider() {
    const hitContainerEl = document.querySelector('.hit-container');

    if (hitContainerEl === null) {
        return;
    }

    tippyInstance.reference = hitContainerEl;

    async function showTippy(markWordElement: HTMLElement) {
        const classname = markWordElement.textContent;
        const generatedCssCode = await (window as any).windpress.module.classnameToCss.generate(classname!);
        if (generatedCssCode === null || generatedCssCode.trim() === '') {
            return null;
        };

        tippyInstance.setContent(shikiHighlighter.codeToHtml(generatedCssCode, {
            lang: 'css',
            theme: 'dark-plus',
        }));

        tippyInstance.show();
    }

    let currentMarkWordElement = null;

    const debouncedMousemoveHandler = debounce(function (event) {
        const x = event.clientX;
        const y = event.clientY;

        // get all elements that overlap the mouse
        const elements = document.elementsFromPoint(x, y);

        // find the first `mark` element
        const firstMarkWordElement = elements.find((element) => {
            return element.matches('mark[class="word"]');
        });

        const newElement = firstMarkWordElement || null;
        if (newElement !== currentMarkWordElement) {
            currentMarkWordElement = newElement;
            if (currentMarkWordElement) {
                showTippy(currentMarkWordElement);
            } else {
                tippyInstance.hide();
            }
        }
    }, 10);

    // when mouse are entering the `.hit-container` element, get the coordinates of the mouse and check if the mouse is hovering the `mark` element
    hitContainerEl.addEventListener('mousemove', debouncedMousemoveHandler);

    hitContainerEl.addEventListener('mouseleave', function () {
        debouncedMousemoveHandler.cancel();
        currentMarkWordElement = null;
        tippyInstance.hide();
    });
}

let currentBlockId: string | null = null;
let latestClasses: string | null = null;
let latestTributeClassName: string | null = null;

function previewTributeEventCallbackUpDown() {
    let li = tribute.menu.querySelector('li.highlight>span.class-name');

    if (latestTributeClassName) {
        previewResetClass(latestTributeClassName);
    }

    latestTributeClassName = li.dataset.tributeClassName;

    previewAddClass(li.dataset.tributeClassName);
}

let menuAutocompleteItemeEl: HTMLElement | null = null;
const observerAutocomplete = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            mutation.addedNodes.forEach((node) => {
                const className = node.querySelector('.class-name').dataset.tributeClassName;

                node.addEventListener('mouseenter', () => {
                    previewAddClass(className);
                });

                node.addEventListener('mouseleave', () => {
                    previewResetClass(className);
                });

                node.addEventListener('click', () => {
                    // previewResetClass();
                }, { capture: true });
            });
        }
    });
});

function getContentDocument() {
    const rootContainer = document.querySelector('iframe[name="editor-canvas"]');
    const contentWindow = rootContainer?.contentWindow || rootContainer;
    return rootContainer?.contentDocument || contentWindow?.document;
}

function previewAddClass(className) {
    const contentDocument = getContentDocument();
    if (!contentDocument) {
        return;
    }

    const block = contentDocument.getElementById(`block-${currentBlockId}`);

    if (block) {
        block.classList.add(className);
    }
}

function previewResetClass(className) {
    const contentDocument = getContentDocument();
    if (!contentDocument) {
        return;
    }

    const block = contentDocument.getElementById(`block-${currentBlockId}`);

    if (block && latestClasses && !latestClasses.includes(className)) {
        block.classList.remove(className);
    }
}

function initializeTextInput(textInputElement: HTMLTextAreaElement) {
    if (!textInputElement) {
        return;
    }
    
    try {
        autosize(textInputElement);
        tribute.attach(textInputElement);
        // Mark this element as having tribute attached
        (textInputElement as any)._tributeAttached = true;
        
        // Increase delay to ensure element is properly mounted
        setTimeout(() => {
            try {
                hit = new HighlightInTextarea(textInputElement, {
                    highlight: [
                        {
                            highlight: /(?<=\s|^)(?:(?!\s).)+(?=\s|$)/g,
                            className: 'word',
                        },
                        {
                            highlight: /(?<=\s)\s/g,
                            className: 'multispace',
                            blank: true,
                        },
                    ],
                });

                hoverPreviewProvider();

                textInputElement.addEventListener('highlights-updated', function () {
                    hoverPreviewProvider();
                });

                textInputElement.addEventListener('tribute-active-true', function () {
                    if (menuAutocompleteItemeEl === null) {
                        menuAutocompleteItemeEl = document.querySelector('.windpressgutenberg-tribute-container>ul');
                    }
                    setTimeout(() => {
                        if (menuAutocompleteItemeEl) {
                            observerAutocomplete.observe(menuAutocompleteItemeEl, {
                                childList: true,
                                subtree: true,
                                attributes: true,
                                attributeFilter: ['class']
                            });
                        }
                    }, 0);
                });

                textInputElement.addEventListener('tribute-active-false', function () {
                    if (latestTributeClassName) {
                        previewResetClass(latestTributeClassName);
                    }
                });

                setTimeout(() => {
                    onTextInputChanges();
                }, 0);
            } catch (error) {
                // Silently handle error
            }
        }, 100); // Increased delay from 10ms to 100ms
    } catch (error) {
        // Silently handle error
    }
}

function onTextInputChanges() {
    setTimeout(() => {
        try {
            hit.handleInput();
        } catch (error) { }
        // Find the text input element that has the tribute attached
        const textInputElements = document.querySelectorAll('textarea');
        for (const element of textInputElements) {
            if ((element as any)._tributeAttached) {
                autosize.update(element as HTMLTextAreaElement);
                break;
            }
        }
        // tribute.setMenuContainer(document.querySelector('div.hit-container'));
        (tribute as any).hideMenu();
    }, 0);
};


function addClassInspectorControls(BlockEdit: React.ComponentType<BlockEditProps>) {
    return (props: BlockEditProps) => {
        const { clientId, attributes, setAttributes } = props;
        const textInputRef = useRef<HTMLTextAreaElement>(null);

        useEffect(() => {
            currentBlockId = clientId;
            latestClasses = attributes.className || null;
        }, [clientId, attributes.className]);

        const textInputCallbackRef = (element: HTMLTextAreaElement | null) => {
            if (element && !element.dataset.windpressInitialized) {
                // Mark as initialized to prevent double initialization
                element.dataset.windpressInitialized = 'true';
                
                // Try immediate initialization first
                const tryInitialization = (retryCount = 0) => {
                    if (retryCount > 5) {
                        return;
                    }
                    
                    // Check if element is properly mounted in DOM
                    if (element.offsetParent === null && element.parentElement) {
                        setTimeout(() => tryInitialization(retryCount + 1), 100);
                        return;
                    }
                    
                    initializeTextInput(element);
                };
                
                // Start initialization with a small delay
                setTimeout(() => tryInitialization(), 50);
            }
            // Also set the ref for other uses
            if (textInputRef.current !== element) {
                (textInputRef as any).current = element;
            }
        };

        function handleValueChange(value: string) {
            setAttributes({ className: value });
            latestClasses = value;
            
            // Trigger HighlightInTextarea to process the new content
            setTimeout(() => {
                if (hit && hit.handleInput) {
                    try {
                        hit.handleInput();
                    } catch (error) {
                        // Silently handle error
                    }
                }
            }, 10);
        }

        async function handleAutomaticClassSorting() {
            const sortedClasses = await (window as any).windpress.module.classSorter.sort(attributes.className);

            setAttributes({ className: sortedClasses });
            latestClasses = sortedClasses;

            onTextInputChanges();
        }

        return (
            <>
                <BlockEdit {...props} />
                <InspectorControls>
                    <PanelBody title={__('WindPress', 'windpress')} icon={WindPressIcon({})} initialOpen={true}>
                        <PanelRow className='windpressgutenberg-actions'>
                            <div>
                                <Button 
                                    showTooltip 
                                    variant='secondary' 
                                    label={__('Automatic Class Sorting', 'windpress')} 
                                    onClick={handleAutomaticClassSorting} 
                                    size="default"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="tabler-icon tabler-icon-reorder icon icon-tabler icons-tabler-outline icon-tabler-reorder">
                                        <path d="M3 15m0 1a1 1 0 0 1 1 -1h2a1 1 0 0 1 1 1v2a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1z"></path>
                                        <path d="M10 15m0 1a1 1 0 0 1 1 -1h2a1 1 0 0 1 1 1v2a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1z"></path>
                                        <path d="M17 15m0 1a1 1 0 0 1 1 -1h2a1 1 0 0 1 1 1v2a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1z"></path>
                                        <path d="M5 11v-3a3 3 0 0 1 3 -3h8a3 3 0 0 1 3 3v3"></path>
                                        <path d="M16.5 8.5l2.5 2.5l2.5 -2.5"></path>
                                    </svg>
                                </Button>
                            </div>
                        </PanelRow>
                        <TextareaControl
                            __nextHasNoMarginBottom
                            value={attributes.className || ''}
                            onChange={(value) => handleValueChange(value)}
                            onInput={(e) => handleValueChange((e.target as HTMLTextAreaElement).value)}
                            ref={textInputCallbackRef}
                            rows={4}
                            placeholder={__('Enter CSS classes...', 'windpress')}
                        />
                    </PanelBody>
                </InspectorControls>
            </>
        );
    };
}

(() => {
    (window as any).wp.hooks.addFilter(
        'editor.BlockEdit',
        'windpress/add-class-inspector-controls',
        addClassInspectorControls
    );
})();
