<script setup>
import postcss from 'postcss';
import tailwindcssNesting from 'tailwindcss/src/postcss-plugins/nesting';
import processTailwindFeatures from 'https://esm.sh/tailwindcss@3/src/processTailwindFeatures';
import resolveConfig from 'tailwindcss/src/public/resolve-config.js';
import { importLocalModule } from '@/packages/core/tailwind/module';

function prepareConfig(configStr) {
    let config = configStr
        // catch multi-line import statements and replace them with single line
        .replace(/import\s+({[^}]+})\s+from\s+['"](.+)['"]/g, (_m, $1, $2) => {
            return `import ${$1.replace(/\n/g, '')} from '${$2}'`;
        })
        // do the rest
        .split('\n')
        .map((line, i) =>
            line.replace(
                /\bimport\s+(.+)\s+from\s+['"](.+)['"]/g,
                (_m, variable, url) => {
                    return `const ${variable.indexOf('{') === -1
                        ? `{default: ${variable}}`
                        : variable.replace(/\s+as\s+/, ': ')
                        } = await import('${url}')`;
                }
            )
        )
        .map((line, i) =>
            line.replace(
                /\brequire\(([^)]*)\)/g,
                (_m, id) =>
                    `(await require(${id.trim() === '' ? 'undefined' : id}, ${i + 1}))`
            )
        )
        .join('\n');

    return /*js*/ `
        import { parse as parsePackage } from 'https://esm.sh/parse-package-name';

        class RequireError extends Error {
            constructor(message, line) {
                super(message);
                this.name = 'RequireError';
                this.line = line;
            }
        }

        let importShim;
        try {
            await (0, eval)('import("")');
        } catch (error) {
            if (error instanceof TypeError) {
                importShim = (0, eval)('u=>import(u)');
            } else {
                var s = document.createElement('script');
                s.src = 'https://esm.sh/shimport/index.js?raw';
                document.head.appendChild(s);
                importShim = __shimport__.load;
            }
        }

        const require = async (m, line) => {
            if (typeof m !== 'string') {
                throw new RequireError('The "id" argument must be of type string. Received ' + typeof m, line)
            }
            if (m === '') {
                throw new RequireError("The argument 'id' must be a non-empty string. Received ''", line)
            }
            let result
            try {
                const _m = parsePackage(m);
                const href = 'https://esm.sh/' + _m.name + '@' + _m.version + _m.path
                result = await importShim(href)
            } catch (error) {
                console.error(error)
                throw new RequireError("Cannot find module '" + m + "'", line)
            }
            return result.default || result
        }
        ${config}
    `;
}


(async () => {
    const processor = postcss();

    let mainCss = /*css*/ `
        @tailwind base;
        @tailwind components;
        @tailwind utilities;
    `;

    let contents = [
        {
            content: `
                <h1 class="text-3xl font-bold underline">
                    Hello world!
                </h1>
            `
        }
    ];

    let configStr = /*js*/ `
        import daisyui from 'https://esm.sh/daisyui?bundle-deps';

        export default {
            safelist: ['bg-red-500','bg-red-600'],
            corePlugins: {
                preflight: false,
            },
            plugins: [
                require('@tailwindcss/typography'),
                daisyui,
            ],
        }
    `;

    console.log('configStr: ', prepareConfig(configStr));

    const configJs = resolveConfig(await importLocalModule('./tailwind.config.js', null, 'config', { '/tailwind.config.js': prepareConfig(configStr) }));

    console.log('twConfigJs resolved: ', configJs);

    let twPostcssPlugin = Object.assign(
        function (opts) {
            return {
                postcssPlugin: 'tailwindcss',
                async Once(root, { result }) {
                    console.log('configJs', configJs);
                    await processTailwindFeatures(({ createContext }) => {
                        return () => createContext(
                            configJs,
                            contents.map((content) => (typeof content === 'string' ? { content } : content))
                        )
                    })(root, result);
                },
            };
        },
        { postcss: true }
    )

    processor.use(twPostcssPlugin);

    processor.use(tailwindcssNesting());

    let processed_css = await processor.process(mainCss, { from: undefined, }).then((result) => result.css);

    console.log(processed_css);

})();

</script>

<template>
    <div class="h:full px:8">
        <h2 class="font:20 font:bold fg:gray-80 fg:gray-10@dark">
            Coming Soon
        </h2>
        <p class="font:14 fg:gray-60 fg:gray-30@dark">
            We are dedicated to providing you with an exceptional customization experience.
            <br>
            Join our <a href="https://www.facebook.com/groups/1142662969627943" target="_blank" class="fg:blue-40@dark">Facebook Group</a> for updates and to share your feedback!
        </p>

        <!-- Ask for reviews -->
        <div class="notice windpress-notice notice-info my:10">
            <p>
                Your <span class="fg:yellow-50">★★★★★</span> 5-star review will encourage us to prioritize the release of this feature.
            </p>
            <p>
                <a href="https://wordpress.org/support/plugin/windpress/reviews/?filter=5/#new-post" target="_blank" class="button button-primary">
                    <font-awesome-icon :icon="['fas', 'star-shooting']" />
                    I will leave a review
                </a>
            </p>
        </div>
    </div>
</template>