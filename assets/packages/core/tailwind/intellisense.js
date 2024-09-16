import { loadDesignSystem } from './design-system';
import { compare } from '@tailwindcss/root/packages/tailwindcss/src/utils/compare';
import { compileCandidates } from '@tailwindcss/root/packages/tailwindcss/src/compile';

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
 * @param {object|DesignSystem} args 
 */
export async function getVariableList(args = {}) {
    let design = args.theme ? args : await loadDesignSystem(args);

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
 * @param {object|DesignSystem} args 
 * @param {Array<string>} classList 
 */
export async function sortClasses(args = {}, classList) {
    let design = args.theme ? args : await loadDesignSystem(args);

    return defaultSort(design.getClassOrder(classList));
}

/**
 * @param {object|DesignSystem} args 
 * @param {Array<string>} classes 
 */
export async function candidatesToCss(args = {}, classes) {
    let design = args.theme ? args : await loadDesignSystem(args);

    return design.candidatesToCss(classes);
}


/**
 * @param {object|DesignSystem} args 
 * @returns {Promise<ClassEntity>} The data with ClassEntity type.
 */
export async function getClassList(args = {}) {
    let design = args.theme ? args : await loadDesignSystem(args);

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
        const astNodes = compileCandidates([classEntity.selector], design).astNodes;

        // if astNodes array is not empty, merge all child's nodes into one array
        const nodes = astNodes.length > 0 ? astNodes.reduce((acc, node) => acc.concat(node.nodes), []) : [];

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
