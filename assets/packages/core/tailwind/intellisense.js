import {
    __unstable__loadDesignSystem,
} from 'tailwindcss';
import { compare } from '@tailwindcss/root/packages/tailwindcss/src/utils/compare';
import { bundle } from './bundle';

/**
 * Get the CSS content of the main.css file on the current document.
 * 
 * @returns {Promise<string>} The CSS content of the main.css file.
 */
export async function getCssContent() {
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

/**
 * @typedef {Object} ClassEntity
 * @property {'utility' | 'variant'} kind - The kind of class entity.
 * @property {string} selector - The CSS selector.
 * @property {Declaration[]} [declarations] - An optional array of declarations.
 * @property {string|null} [css] - An optional CSS string or null.
 */

/**
 * @param {string|DesignSystem} theme - The main.css content.
 * @returns {ClassEntity} The data with ClassEntity type.
 */
export async function getClassList(theme) {
    let design;

    if (typeof theme === 'string') {
        design = await __unstable__loadDesignSystem(theme);
    } else {
        design = theme;
    }

    /** @type {ClassEntity[]} */
    const classList = getUtilityList(design).concat(
        getVariantList(design).concat(unsupportedUtilityList())
    );

    /**
     * Exclude utilities
     * @param {ClassEntity} classEntity - The class entity.
     * @returns {boolean} The boolean value.
     */
    const excludeUtilities = (classEntity) => {
        return classEntity.selector !== '*';
    };


    /**
     * @param {ClassEntity} classEntity 
     * @returns {ClassEntity}
     */
    const prepareClass = (classEntity) => {
        const rule = design.compileAstNodes(classEntity.selector)?.node;
        const nodes = rule?.nodes;

        let css = design.candidatesToCss([classEntity.selector]).at(0);

        /**
         * Calculate rem to px
         */
        if (css) {
            css = css.replaceAll(/([0-9.]+)rem/g, (_match, p1) => {
                return `${parseFloat(p1) * 16}px`
            });
        }

        /**
         * Remove backslash for utilities that use a dot (like m-0.5)
         */
        css = css?.replaceAll(/\\/g, '');

        return {
            ...classEntity,
            declarations: nodes?.filter(
                (node) => node.kind === 'declaration'
            ),
            css
        };
    }

    /**
     * @param {ClassEntity} a - The first class entity.
     * @param {ClassEntity} z - The second class entity.
     */
    const sortselectors = (a, z) => {
        // if prefix with '-' then sort it to the end, otherwise sort it normally
        if (a.selector.startsWith('-') && !z.selector.startsWith('-')) {
            return 1;
        } else if (!a.selector.startsWith('-') && z.selector.startsWith('-')) {
            return -1;
        } else {
            return compare(a.selector, z.selector);
        }
    }

    return classList
        .filter(excludeUtilities)
        .map(prepareClass)
        .sort(sortselectors);
}

/**
 * @param {DesignSystem} design
 */
function getUtilityList(design) {
    return design.getClassList().map((classEntry) => ({
        kind: 'utility',
        selector: classEntry[0]
    }));
}

/**
 * @param {DesignSystem} design
 */
function getVariantList(design) {
    return design.getVariants().map((classEntry) => ({
        kind: 'variant',
        selector: classEntry.name
    }));
}

/**
 * A list of utilities that for some reason are missing from the getUtilityList call
 */
function unsupportedUtilityList() {
    return [
        {
            kind: 'utility',
            selector: 'flex'
        }
    ];
}

export async function getVariableList(theme) {
    let design;

    if (typeof theme === 'string') {
        design = await __unstable__loadDesignSystem(theme);
    } else {
        design = theme;
    }

    return Array.from(design.theme.entries()).map(
        (entry, index) => {
            const variable = entry[0];

            const defaultValue = entry[1].value;
            const calculatedValue = `${parseFloat(defaultValue) * 16}px`;

            const isCalculated = defaultValue.includes('rem');

            return {
                key: variable,
                value: isCalculated
                    ? calculatedValue
                    : defaultValue,
                index
            }
        }
    );
}

/**
 * @param {string|DesignSystem} theme 
 * @param {Array<string>} classList 
 * @returns 
 */
export async function sortClasses(theme, classList) {
    let design;

    if (typeof theme === 'string') {
        design = await __unstable__loadDesignSystem(theme);
    } else {
        design = theme;
    }

    return defaultSort(design.getClassOrder(classList));
}

function defaultSort(arrayOfTuples) {
    return arrayOfTuples
        .sort(([, a], [, z]) => {
            if (a === z) return 0;
            if (a === null) return -1;
            if (z === null) return 1;
            return bigSign(a - z);
        })
        .map(([className]) => className);
}

function bigSign(value) {
    if (value > 0n) {
        return 1;
    } else if (value === 0n) {
        return 0;
    } else {
        return -1;
    }
}

/**
 * @param {string|DesignSystem} theme 
 * @param {Array<string>} classList 
 * @returns 
 */
export async function candidatesToCss(theme, classes) {
    let design;

    if (typeof theme === 'string') {
        design = await __unstable__loadDesignSystem(theme);
    } else {
        design = theme;
    }

    return design.candidatesToCss(classes);
}