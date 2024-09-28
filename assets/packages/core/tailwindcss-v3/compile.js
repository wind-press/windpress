import postcss from 'postcss';
import tailwindcssNesting from 'tailwindcss/src/postcss-plugins/nesting';
import tailwindcssPostcssPlugin from './postcss-plugins/tailwindcss/index';
import { resolveConfig } from './resolve-config';

export async function compile(opts) {
    const config = await resolveConfig(opts.volume[opts.entrypoint.config]);
    const contents = opts.contents.map((content) => (typeof content === 'string' ? { content } : content));

    const processor = postcss()
        .use(tailwindcssPostcssPlugin(config, contents))
        .use(tailwindcssNesting());

    return await processor.process(opts.volume[opts.entrypoint.css], { from: undefined, }).then((result) => result.css);
}