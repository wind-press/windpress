import twResolveConfig from 'https://esm.sh/tailwindcss@3/src/public/resolve-config.js';
import { importLocalModule } from '@/packages/core/tailwindcss-v4/module';

export async function resolveConfig(configStr) {
    configStr = prepareConfig(configStr);

    const importedConfig = await importLocalModule('./tailwind.config.js', null, 'config', { '/tailwind.config.js': configStr });

    return twResolveConfig(importedConfig);
}

export function prepareConfig(configStr) {
    return configStr
        // replace the module.exports = with export default
        .replace(/module.exports\s*=\s*/, 'export default ')
        // catch multi-line import statements and replace them with single line
        .replace(/import\s+({[^}]+})\s+from\s+['"](.+)['"]/g, (_, $1, $2) => {
            return `import ${$1.replace(/\n/g, '')} from '${$2}'`;
        })
        // do the rest
        .split('\n')
        .map((line) => {
            return line
                // replace import statements with dynamic imports
                .replace(
                    /\bimport\s+(.+)\s+from\s+['"](.+)['"]/g,
                    (_, variable, m) => {
                        // if the module is not a URL or a relative path, use esm.sh
                        if (!m.startsWith('http') && !m.startsWith('./')) {
                            m = `https://esm.sh/${m}`;
                        }

                        return `const ${variable.indexOf('{') === -1 ? `{default: ${variable}}` : variable.replace(/\s+as\s+/, ': ')} = await import('${m}')`;
                    }
                )

                // alias require to import
                .replace(
                    /\brequire\(['"]([^'"]*)['"]\)/g,
                    (_, m) => {
                        // if the module is not a URL or a relative path, use esm.sh
                        if (!m.startsWith('http') && !m.startsWith('./')) {
                            m = `https://esm.sh/${m}`;
                        }

                        return `(await import('${m}')).default`;
                    }
                )
        })
        .join('\n');
}