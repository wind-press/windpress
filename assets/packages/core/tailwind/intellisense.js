import {
    __unstable__loadDesignSystem,
} from 'tailwindcss';
import { compare } from '@tailwindcss/root/packages/tailwindcss/src/utils/compare';

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
export function getClassList(theme) {
    let design;

    if (typeof theme === 'string') {
        design = __unstable__loadDesignSystem(theme);
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
        return compare(a.selector, z.selector);
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

export function getVariableList(theme) {
    let design;

    if (typeof theme === 'string') {
        design = __unstable__loadDesignSystem(theme);
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
