import { customAlphabet } from 'nanoid';
import { merge } from 'lodash-es';

const randomId = () => customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 6)();

function generateId() {
    let id = randomId();

    while (id.match(/^\d/)) {
        id = randomId();
    }

    return `siul${id}`;
}

/**
 * 
 * @param {HTMLElement} domData 
 * @returns 
 */
export function parse(domData) {
    // current node is the root (body) node, so we directly parse its children
    const elements = [];
    domData.childNodes.forEach((node) => {
        const transformedNode = transformNode(node);
        if (transformedNode) {
            elements.push(transformedNode);
        }
    });

    return flattenElements(elements, 0);
}

/**
 * 
 * @param {Element} el 
 */
function transformElement(el) {
    const tagName = el.tagName.toLowerCase();
    const brxNode = {
        id: generateId(),
        name: 'div',
        settings: {
            tag: tagName,
        },
        children: [],
    };
    
    const attrs = [];

    const preservedAttrs = ['id', 'class', 'href', 'src'];

    Object.keys(el.attributes).forEach((attrIndex) => {
        const attrName = el.attributes[attrIndex].name;
        if (!preservedAttrs.includes(attrName)) {
            attrs.push({
                id: generateId(),
                name: attrName,
                value: el.attributes[attrIndex].value,
            });
        } else {
            if (attrName === 'class' && el.attributes[attrIndex].value.trim() !== '') {
                merge(brxNode.settings, {
                    _cssClasses: el.attributes[attrIndex].value,
                });
            }

            if (attrName === 'id' && el.id.trim() !== '') {
                merge(brxNode.settings, {
                    _cssId: el.id,
                });
            }

            if (attrName === 'href' && el.tagName.toLowerCase() === 'a') {
                merge(brxNode.settings, {
                    link: {
                        url: el.getAttribute('href'),
                    }
                });
            }
        }
    });

    merge(brxNode.settings, {
        _attributes: attrs,
    });

    // html: svg → bricks: svg
    if (tagName === 'svg') {
        brxNode.name = 'svg';
        merge(brxNode.settings, {
            source: 'code',
            code: el.outerHTML,
        });

        // remove attributes
        brxNode.settings._attributes = [];

        return brxNode;
    }

    // html: img → bricks: image
    if (tagName === 'img') {
        let src = el.getAttribute('src');

        brxNode.name = 'image';
        merge(brxNode.settings, {
            image: {
                external: true,
                url: src || '',
                full: src || '',
                filename: src.split('/').pop() || '',
            },
            altText: el.getAttribute('alt') || '',
        });

        delete brxNode.settings.tag;

        return brxNode;
    }

    // html: heading {1, 2, 3, 4, 5, 6} → bricks: heading
    if (tagName.match(/h[1-6]/)) {
        brxNode.name = 'heading';
        merge(brxNode.settings, {
            text: el.innerText,
            tag: tagName,
        });
    }

    // html: video, iframe[src*="youtube.com"], iframe[src*="vimeo.com"] → bricks: video
    if (tagName === 'video' || (tagName === 'iframe' && (el.getAttribute('src').includes('youtube.com') || el.getAttribute('src').includes('vimeo.com')))) {
        brxNode.name = 'video';
        merge(brxNode.settings, {
            source: 'url',
            url: tagName === 'video' ? el.getAttribute('src') : el.getAttribute('src').split('?')[0],
        });

        delete brxNode.settings.tag;

        return brxNode;
    }

    // html: a → bricks: text-basic, text-link, button
    if (tagName === 'a') {
        merge(brxNode.settings, {
            link: {
                type: 'external',
                url: el.getAttribute('href') || '',
                newTab: el.getAttribute('target') === '_blank',
                ariaLabel: el.getAttribute('aria-label') || '',
                title: el.getAttribute('title') || '',
                rel: el.getAttribute('rel') || '',
            }
        });

        if (el.children.length === 0) {
            brxNode.name = 'text-basic';
            merge(brxNode.settings, {
                text: el.innerText,
            });

            return brxNode;
        } else {
            merge(brxNode.settings, {
                text: el.innerText,
            });
        }
    }

    el.childNodes.forEach((node) => {
        const transformedNode = transformNode(node);
        if (transformedNode) {
            brxNode.children.push(transformedNode);
        }
    });

    return brxNode;
}

/**
 * using childNodes instead of children
 * 
 * @param {ChildNode} node 
 */
function transformNode(node) {
    if (node.nodeType === Node.ELEMENT_NODE) {
        return transformElement(/** @type {Element} */ (node));
    }

    if (node.nodeType === Node.TEXT_NODE && node.nodeValue.trim() !== '') {
        return {
            id: generateId(),
            name: 'text-basic',
            settings: {
                tag: 'span',
                text: node.nodeValue,
            },
            children: [],
        };
    }

    return null;
}

/**
 * Recursively flatten the tree of elements
 * 
 * @param {*} tree 
 * @param {*} parent 
 * @returns 
 */
function flattenElements(tree, parent) {
    const flattened = [];

    tree.forEach((el) => {
        el.parent = parent;
        el._children = el.children.map((child) => child.id);
        flattened.push(el);
        flattened.push(...flattenElements(el.children, el.id));
        el.children = el._children;
        delete el._children;
    });

    return flattened;
}