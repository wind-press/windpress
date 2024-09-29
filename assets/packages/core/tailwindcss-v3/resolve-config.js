import twResolveConfig from 'https://esm.sh/tailwindcss/src/public/resolve-config.js';
import { importLocalModule } from '@/packages/core/tailwindcss-v4/module';

export async function resolveConfig(configStr) {
    configStr = prepareConfig(configStr);

    const importedConfig = await importLocalModule('./tailwind.config.js', null, 'config', { '/tailwind.config.js': configStr });

    return twResolveConfig(importedConfig);
}

export function prepareConfig(configStr) {
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
        class RequireError extends Error {
            constructor(message, line) {
                super(message);
                this.name = 'RequireError';
                this.line = line;
            }
        }

        let parsePackage = null;

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
                throw new RequireError('The "id" argument must be of type string. Received ' + typeof m, line);
            }
            if (m === '') {
                throw new RequireError("The argument 'id' must be a non-empty string. Received ''", line);
            }
            let result
            try {
                if (!parsePackage) {
                    parsePackage = (await importShim('https://esm.sh/parse-package-name')).parse;
                }

                const _m = parsePackage(m);
                const href = 'https://esm.sh/' + _m.name + '@' + _m.version + _m.path;
                result = await importShim(href);
            } catch (error) {
                throw new RequireError("Cannot find module '" + m + "'", line);
            }
            return result.default || result;
        }

        ${config}
    `;
}