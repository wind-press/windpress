import { set } from 'lodash-es';
import { createContext } from 'https://esm.sh/tailwindcss@3/src/lib/setupContextUtils';
import { generateRules } from 'https://esm.sh/tailwindcss@3/src/lib/generateRules';
import { decodeVFSContainer } from '@/packages/core/tailwindcss-v4';
import { bigSign } from '@/packages/core/tailwindcss-v4/intellisense';
import { resolveConfig } from '../resolve-config';

const vfsContainer = document.querySelector('script#windpress\\:vfs[type="text/plain"]');

function prefixCandidate(context, selector) {
    const prefix = context.tailwindConfig.prefix;

    return typeof prefix === 'function' ? prefix(selector) : prefix + selector;
}

function getClassOrderPolyfill(classes, context) {
    const parasiteUtilities = new Set([
        prefixCandidate(context, 'group'),

        prefixCandidate(context, 'peer'),
    ]);

    const classNamesWithOrder = [];

    for (const className of classes) {
        let order =
            generateRules(new Set([className]), context).sort(([a], [z]) =>
                bigSign(z - a)
            )[0]?.[0] ?? null;

        if (order === null && parasiteUtilities.has(className)) {
            order = context.layerOrder.components;
        }

        classNamesWithOrder.push([className, order]);
    }

    return classNamesWithOrder;
}

async function classSorter(classes) {
    const volume = decodeVFSContainer(vfsContainer.textContent);

    const parts = classes
        .split(/\s+/)
        .filter((x) => x !== "" && x !== "|");

    const unknownClassNames = [];

    const resolvedConfig = await resolveConfig(volume);

    const context = createContext(resolvedConfig);

    const knownClassNamesWithOrder = context.getClassOrder
        ? context.getClassOrder(parts)
        : getClassOrderPolyfill(parts, context);

    const knownClassNames = knownClassNamesWithOrder
        .sort(([, a], [, z]) => {
            if (a === z) return 0;

            if (a === null) return -1;

            if (z === null) return 1;

            return bigSign(a - z);
        })
        .map(([className]) => className);

    return [...unknownClassNames, ...knownClassNames].join(' ');
}

// if the wp-hooks is available
if (window.wp?.hooks) {
    window.wp.hooks.addFilter('windpress.module.class-sorter', 'windpress', classSorter);
}

set(window, 'windpress.loaded.module.classSorter', true);
set(window, 'windpress.module.classSorter.sort', async (input) => classSorter(input));