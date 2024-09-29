import postcss from 'postcss';
import { set } from 'lodash-es';
import evaluateTailwindFunctions from 'https://esm.sh/tailwindcss/src/lib/evaluateTailwindFunctions';
import { createContext } from 'https://esm.sh/tailwindcss/src/lib/setupContextUtils';
import { generateRules as twGenerateRules } from 'https://esm.sh/tailwindcss/src/lib/generateRules';
import { decodeVFSContainer } from '@/packages/core/tailwindcss-v4/bundle';
import { addPixelEquivalentsToValue } from '@/packages/core/tailwindcss-v4/intellisense';
import { resolveConfig } from '../resolve-config';

const vfsContainer = document.querySelector('script[type="text/tailwindcss"]');

async function classnameToCss(input) {
    let classes = input
        .split(/\s+/)
        .filter((x) => x !== "" && x !== "|");

    const volume = decodeVFSContainer(vfsContainer.textContent);

    const resolvedConfig = await resolveConfig(volume['/tailwind.config.js']);

    const context = createContext(resolvedConfig);

    let css = classes
        .map((className) => generate(className, context)).filter((x) => x !== null)
        .map((value) => addPixelEquivalentsToValue(value, 16));

    return Array.isArray(css) ? css.join(" ") : css;
}

function generate(className, context) {
    if (className === null) return null;

    let { root, rules } = generateRules([className], context);

    if (rules.length === 0) {
        return null;
    }

    return stringifyRoot(root);
}

function generateRules(classNames, context, filter = () => true) {
    let rules = twGenerateRules(new Set(classNames), context)
        .sort(([a], [z]) => bigSign(a - z));

    let root = postcss.root({ nodes: rules.map(([, rule]) => rule) });

    evaluateTailwindFunctions(context)(root);

    let actualRules = [];
    root.walkRules((subRule) => {
        if (filter(subRule)) {
            actualRules.push(subRule)
        }
    });

    return {
        root,
        rules: actualRules,
    };
}

function stringifyRoot(root) {
    let clone = root.clone();

    clone.walkAtRules('defaults', (node) => {
        node.remove();
    });

    return clone.toString().replace(/([^;{}\s])(\n\s*})/g, (_match, before, after) => `${before};${after}`);
}

// if the wp-hooks is available
if (window.wp?.hooks) {
    window.wp.hooks.addFilter('windpress.module.classname-to-css', 'windpress', classnameToCss);
}

set(window, 'windpress.loaded.module.classnameToCss', true);
set(window, 'windpress.module.classnameToCss.generate', async (input) => classnameToCss(input));