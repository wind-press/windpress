import { set } from 'lodash-es';
import Fuse from 'fuse.js';
import { doComplete } from 'https://esm.sh/tailwindcss-language-service';
import { decodeVFSContainer } from '@/packages/core/tailwindcss-v4/bundle';
import { getTextDocument, splitClassWithSeparator, stateFromConfig } from '../intellisense';
import { resolveConfig } from '../resolve-config';

const vfsContainer = document.querySelector('script[type="text/tailwindcss"]');

async function searchClassList(query) {
    const volume = decodeVFSContainer(vfsContainer.textContent);

    const resolvedConfig = await resolveConfig(volume['/tailwind.config.js']);

    return await getSuggestionList(query, resolvedConfig);
}

async function getSuggestionList(className, resolvedConfig) {
    const textDocument = getTextDocument(`<span class='${className}'></span>`);

    // TODO: move to global and cache, update on config change
    const state = stateFromConfig(resolvedConfig);

    let [classCandidate, ...variants] = splitClassWithSeparator(
        className,
        resolvedConfig.separator
    ).reverse();

    if (classCandidate.startsWith("!")) {
        classCandidate = classCandidate.slice(1);
    }

    const position = {
        character: 13 + className.length,
        line: 0,
    };

    const results = (
        await doComplete(state, textDocument, position)
    ).items.map((item) => {
        return {
            value: item.label,
            color: typeof item.documentation === "string" ? item.documentation : null,
            isVariant: item.data._type === "variant",
            variants: item.data?.variants ?? variants.reverse(),
            important: item.data?.important ?? false,
        };
    });

    if (classCandidate.length === 0) {
        return results;
    }

    const fuse = new Fuse(results, {
        keys: ['value'],
        threshold: 0.4,
    });

    return fuse.search(classCandidate).map(({ item }) => item);
}

// check if the wp-hooks is available
if (window.wp?.hooks) {
    window.wp.hooks.addFilter('windpress.module.autocomplete', 'windpress', searchClassList);
}

set(window, 'windpress.loaded.module.autocomplete', true);
set(window, 'windpress.module.autocomplete.query', (q) => searchClassList(q));
