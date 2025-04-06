import { compare } from '@tailwindcss/root/packages/tailwindcss/src/utils/compare';
import { compileCandidates } from '@tailwindcss/root/packages/tailwindcss/src/compile';
import parseValue from 'postcss-value-parser';

import type { DesignSystem } from '@tailwindcss/root/packages/tailwindcss/src/design-system';

export type ClassEntity = {
    kind: 'utility' | 'variant' | 'user';
    selector: string;
    declarations?: any[];
    css?: string;
}

function getUtilityList(design: DesignSystem): ClassEntity[] {
    return design.getClassList().map((classEntry) => ({
        kind: 'utility',
        selector: classEntry[0]
    }));
}

function getVariantList(design: DesignSystem): ClassEntity[] {
    return design.getVariants().map((classEntry) => ({
        kind: 'variant',
        selector: classEntry.name
    }));
}

/**
 * A list of utilities that for some reason are missing from the getUtilityList call
 */
function unsupportedUtilityList(): ClassEntity[] {
    return [
        {
            kind: 'utility',
            selector: 'flex'
        }
    ];
}

function defaultSort(arrayOfTuples: [string, bigint | null][]): string[] {
    return arrayOfTuples
        .sort(([, a], [, z]) => {
            if (a === z) return 0;
            if (a === null) return -1;
            if (z === null) return 1;
            return bigSign(a - z);
        })
        .map(([className]) => className);
}

export function bigSign(value: number | bigint) {
    if (value > 0n) {
        return 1;
    } else if (value === 0n) {
        return 0;
    } else {
        return -1;
    }
}

export async function getVariableList(design: DesignSystem) {
    return Array.from(design.theme.entries()).map(
        (entry, index) => {
            const variable = entry[0];
            let isCalculated = false;
            let calculatedValue = null;

            const defaultValue = entry[1].value;

            if (typeof defaultValue === 'string' && defaultValue.includes('rem')) {
                calculatedValue = `${parseFloat(defaultValue) * 16}px`;
                isCalculated = true;
            }

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

export async function sortClasses(design: DesignSystem, classList: string[]) {
    return defaultSort(design.getClassOrder(classList));
}

export function addPixelEquivalentsToValue(value: string, rootFontSize: number) {
    if (!value?.includes('rem')) {
        return value;
    }

    const commentPool: { content: string; sourceEndIndex: number }[] = [];

    parseValue(value).walk((node) => {
        if (node.type !== 'word') {
            return true;
        }

        const unit = parseValue.unit(node.value);
        if (!unit || (unit.unit !== 'rem' && unit.unit !== 'rem;')) {
            return false;
        }

        const commentStr = ` /* ${parseFloat(unit.number) * rootFontSize}px */`;

        commentPool.push({
            content: commentStr,
            sourceEndIndex: node.sourceEndIndex
        });

        return false;
    });

    let offset = 0;
    commentPool.forEach((comment) => {
        value = value.slice(0, comment.sourceEndIndex + offset) + comment.content + value.slice(comment.sourceEndIndex + offset)
        offset += comment.content.length
    });

    return value;
}

export async function candidatesToCss(design: DesignSystem, classes: string[]) {
    let css = design.candidatesToCss(classes);

    css = css.map((value: string | null) => value ? addPixelEquivalentsToValue(value, 16) : value);

    return css;
}

export function getClassList(design: DesignSystem): ClassEntity[] {
    const classList: ClassEntity[] = getUtilityList(design).concat(
        getVariantList(design).concat(unsupportedUtilityList())
    );

    /**
     * Exclude utilities
     */
    const excludeUtilities = (classEntity: ClassEntity): boolean => {
        return classEntity.selector !== '*';
    };

    const prepareClass = (classEntity: ClassEntity): ClassEntity => {
        const astNodes = compileCandidates([classEntity.selector], design).astNodes;

        // if astNodes array is not empty, merge all child's nodes into one array
        const nodes = astNodes.flatMap(node => "nodes" in node ? node.nodes : []);

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

    const sortselectors = (a: ClassEntity, z: ClassEntity) => {
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

export function naturalExpand(value: number, total?: number) {
    const length = typeof total === 'number' ? total.toString().length : 8
    return ('0'.repeat(length) + value).slice(-length)
}