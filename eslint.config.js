import pluginVue from 'eslint-plugin-vue'
import oxlint from 'eslint-plugin-oxlint';
import tseslint from 'typescript-eslint';

export default tseslint.config(
    // add more generic rulesets here, such as:
    // js.configs.recommended,
    tseslint.configs.recommended,
    ...pluginVue.configs['flat/recommended'],,
    {
        files: ['*.vue', '**/*.vue'],
        languageOptions: {
            parserOptions: {
                parser: '@typescript-eslint/parser'
            }
        }
    },
    ...oxlint.configs['flat/recommended'], // oxlint should be the last one
)